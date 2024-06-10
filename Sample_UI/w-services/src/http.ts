import { WealthConfig } from '@axioma/wealth-config';
import { accessToken, tokenType } from './authentication';
import { HttpStatusCodes } from '@axioma/core';

export type AuthFetchOption = {
	method?: RequestInit['method'];
	body?: string | FormData;
	headers?: Record<string, string>;
	mode?: RequestMode;
}
export const CONTENT_TYPE_JSON = 'application/json';

export type AuthFetcherOption = Omit<AuthFetchOption, 'method'>;

export enum FetchMethodEnum {
	Get = 'GET',
	Post = 'POST',
	Put = 'PUT',
	Delete = 'DELETE',
	Patch = 'PATCH'
}

type ResponseCommon = 'status' | 'statusText' | 'headers' | 'json' | 'text';
// wait for gallery to expose relevant stuff;
export type FetchResponse<T> = Pick<Response, ResponseCommon> & { body: T };

export const fetcher = {
	get<T>(url: string, opts?: AuthFetchOption): Promise<FetchResponse<T>> {
		return fetch(url, {
			headers: {
				'Authorization': `${tokenType()} ${accessToken()}`,
				...opts?.headers || {}
			}
		}).then(r => {
			if (r.status === HttpStatusCodes.UNAUTHORIZED) {
				return signOut().then(Promise.reject);
			} else {
				return r;
			}
		}) as unknown as Promise<FetchResponse<T>>;
	},
	post<T = unknown>(url: string, opts?: AuthFetchOption): Promise<FetchResponse<T>> {
		return fetch(url, {
			method: 'POST',
			headers: {
				'Authorization': `${tokenType()} ${accessToken()}`,
				...opts?.headers || {}
			},
			body: opts?.body,
			mode: opts?.mode
		}).then(r => {
			if (r.status === HttpStatusCodes.UNAUTHORIZED) {
				return signOut().then(Promise.reject);
			} else {
				return r;
			}
		}) as unknown as Promise<FetchResponse<T>>;
	},
	put<T>(url: string, opts?: AuthFetchOption): Promise<FetchResponse<T>> {
		return fetch(url, {
			method: 'PUT',
			headers: {
				'Authorization': `${tokenType()} ${accessToken()}`,
				...opts?.headers || {}
			},
			body: opts?.body,
			mode: opts?.mode
		}).then(r => {
			if (r.status === HttpStatusCodes.UNAUTHORIZED) {
				return signOut().then(Promise.reject);
			} else {
				return r;
			}
		}) as unknown as Promise<FetchResponse<T>>;
	},
	delete(url: string): Promise<FetchResponse<void>> {
		return fetch(url, {
			method: 'DELETE',
			headers: {
				'Authorization': `${tokenType()} ${accessToken()}`
			}
		}).then(r => {
			if (r.status === HttpStatusCodes.UNAUTHORIZED) {
				return signOut().then(Promise.reject);
			} else {
				return r;
			}
		}) as unknown as Promise<FetchResponse<void>>;
	},
	bodyAsJson(body: unknown): AuthFetcherOption {
		return {
			body: JSON.stringify(body),
			headers: {
				'Content-Type': `${CONTENT_TYPE_JSON};charset=utf-8`
			}
		};
	},
	bodyAsFormData(body: FormData): AuthFetcherOption {
		return {
			body
		};
	},
	postBodyAsJson(body: unknown): AuthFetchOption {
		return {
			method: FetchMethodEnum.Post,
			headers: {
				'Content-Type': `${CONTENT_TYPE_JSON};charset=utf-8`
			},
			body: JSON.stringify(body)
		};
	}
};

const signOutCallbacks: Array<() => void> = [];
export function onSignOut(cb: () => void): void {
	signOutCallbacks.push(cb);
}
export async function signOut(): Promise<void> {
	const _accessToken = accessToken(true);
	if (!_accessToken) {
		return;
	}
	Promise.all(signOutCallbacks.map(cb => Promise.resolve(cb()))).finally(() => {
		const delay = 1000;
		setTimeout(() => {
			signOutCallbacks.length = 0;
			sessionStorage.removeItem('wealth_access_token');
			const { aadB2cRedirectUri, aadB2cTenant, aadB2cP } = WealthConfig;
			location.assign(`https://${aadB2cTenant}.b2clogin.com/${aadB2cTenant}.onmicrosoft.com/${aadB2cP}/oauth2/v2.0/logout?id_token_hint=${_accessToken}&post_logout_redirect_uri=${aadB2cRedirectUri}`);
		}, delay);
	});
}