
import { WealthConfig } from '@axioma/wealth-config';
import { beginFS, trySetIdentity } from '@axioma-api/wealth-fs';
import { currentUser } from './currentUser';

type JWT = {
	exp: number;
	iss: string;
	sub: string;
	token: string;
	refresh: string | null;
	tfp?: string; // Trust framework policy
}
const toBase64 = (window as unknown as Record<string, (v: string) => string>)['bota'.split('').reverse().join('')];
export function parseJwt(token: string): JWT {
	const base64Payload = token.split('.')[1];
	const payload = toBase64(base64Payload);
	return JSON.parse(payload.toString());
}

const ACCESS_TOKEN = 'wealth_access_token';

let _tokenType = 'Bearer';
let _accessToken = '';

export const tokenType = (): string => _tokenType;
export const accessToken = (skipExpiryCheck = false): string | null => {
	const token = sessionStorage.getItem(ACCESS_TOKEN) as string;
	if (token) {
		// validation?
		const jwt = parseJwt(token);
		if (jwt.tfp === WealthConfig.aadB2cP) {
			if (currentUser.name === '') {
				setCurrentUser(jwt);
			}
			// TODO need to confirm with backend how to handle expired token for logout
			const MILLIS = 1000;
			if (!skipExpiryCheck && jwt && (jwt.exp * MILLIS) > Date.now()) {
				return token;
			}
			return token;
		}
	}
	return null;
};

export function signIn(successCallback: () => unknown): void {
	const existingAccessToken = accessToken();
	if (!existingAccessToken) {
		const isRedirected = checkRedirectHash();
		if (isRedirected) {
			sessionStorage.setItem(ACCESS_TOKEN, _accessToken);
			const jwt = parseJwt(_accessToken);
			if (jwt.tfp === WealthConfig.aadB2cP) {
				setCurrentUser(jwt);
				const idx = location.href.indexOf('/#');
				if (idx >= 0) {
					const noHashURL = location.href.substring(0, idx);
					window.history.replaceState('', document.title, noHashURL);
					sessionStorage.setItem('FIRST_LOGIN', 'true');
					successCallback();
				}
			} else {
				const url = buildLoginUrl();
				location.assign(url);
			}
		} else {
			const url = buildLoginUrl();
			location.assign(url);
		}
	} else {
		sessionStorage.setItem(ACCESS_TOKEN, existingAccessToken);
		const jwt = parseJwt(existingAccessToken);
		sessionStorage.setItem('FIRST_LOGIN', 'false');
		setCurrentUser(jwt);
		// further check on accessTokenFromStorage: is valid? is expired? redirect if needed...
		successCallback();
	}
}

function checkRedirectHash() {
	const accessTokenKey = 'access_token';
	const tokenTypeKey = 'token_type';
	const hashes = location.hash.substring(1).split('&');
	let found = hashes.find(h => h.startsWith(accessTokenKey));
	if (found) {
		_accessToken = new RegExp(`${accessTokenKey}=(.*)`).exec(found)?.[1] as string;
	}
	found = hashes.find(h => h.startsWith(tokenTypeKey));
	if (found) {
		_tokenType = new RegExp(`${tokenTypeKey}=(.*)`).exec(found)?.[1] as string;
	}
	return !!_accessToken;
}


export function checkForgotPasswordFlow(): boolean {
	const href = window.location.href;
	const url = new URL(href);
	const hash = url.hash;
	const parts = hash.substring(1).split('&');
	let isAccessDenied = false;
	let isForgotPassword = false;
	if (parts.length >= 2) {
		for (const pair of parts) {
			const [key, value] = pair.split('=');
			if (key === 'error' && value === 'access_denied') {
				isAccessDenied = true;
			} else if (key === 'error_description' && value.startsWith('AADB2C90118')) {
				isForgotPassword = true;
			}
		}
	}
	if (isAccessDenied && isForgotPassword) {
		window.location.assign(buildForgotPasswordUrl());
		return true;
	}
	return false;
}

export function buildLoginUrl(): string {
	const { aadB2cP } = WealthConfig;
	return buildAadB2cAuthUrl(aadB2cP);
}

function buildForgotPasswordUrl(): string {
	const { aadB2cPasswordReset } = WealthConfig;
	return buildAadB2cAuthUrl(aadB2cPasswordReset);
}

function buildAadB2cAuthUrl(policy: string): string {
	const { aadB2cClientId, aadB2cRedirectUri, aadB2cTenant, aadB2cScope } = WealthConfig;
	const qsObj: Record<string, string> = {
		p: policy,
		'response_type': 'token',
		'client_id': aadB2cClientId,
		scope: aadB2cScope,
		'redirect_uri': encodeURIComponent(aadB2cRedirectUri)
	} as const;
	const qs = Object.keys(qsObj).map(k => `${k}=${qsObj[k]}`).join('&');
	const base = `https://${aadB2cTenant}.b2clogin.com/${aadB2cTenant}.onmicrosoft.com/oauth2/v2.0/authorize?`;
	return `${decodeURIComponent(base.concat(qs))}`;
}

function setCurrentUser(_jwt: ReturnType<typeof parseJwt>): void {
	const jwt = _jwt as ReturnType<typeof parseJwt> & { emails: string[]; name: string };
	let sent = false;
	currentUser.emails = jwt.emails;
	currentUser.name = jwt.name;
	beginFS();
	const userHashString = jwt.name + jwt.emails[0];
	digestUser(userHashString).then(hashedUser => {
		const isAxiomaUser = currentUser.isAxiomaUser();
		if (isAxiomaUser) {
			if (!sent) {
				sent = true;
				trySetIdentity(hashedUser, { displayName: hashedUser.slice(0, 7), version: Config.forcedVersion, wealth: true, isAxiomaUser });
			}
		} else {
			trySetIdentity(hashedUser, { displayName: hashedUser.slice(0, 7), version: Config.forcedVersion, wealth: true });
		}
	});
}

// https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest#converting_a_digest_to_a_hex_string
async function digestUser(user: string) {
	const userUint8 = new TextEncoder().encode(user);                           // encode as (utf-8) Uint8Array
	const hashBuffer = await crypto.subtle.digest('SHA-256', userUint8);           // hash the message
	const hashArray = Array.from(new Uint8Array(hashBuffer));                     // convert buffer to byte array
	return hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
}
