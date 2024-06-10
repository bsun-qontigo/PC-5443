import './title';
export interface IWealthConfig {
	readonly wealthUrl: string;
	readonly cdnUrl: string;
	readonly aadB2cTenant: string;
	readonly aadB2cClientId: string;
	readonly aadB2cClientSecret?: string;
	readonly aadB2cRedirectUri: string;
	readonly aadB2cScope: string;
	readonly aadB2cP: string;
	readonly aadB2cPasswordReset: string;
}
let _WealthConfig: IWealthConfig;

if (location.origin.startsWith('http://localhost:5000')) {
	/** dev **/
	_WealthConfig = {
		wealthUrl: 'NOT_USED_BY_DEMO',
		cdnUrl: 'http://localhost:3789',
		// wealthUrl: 'http://localhost:8124/batch',
		aadB2cTenant: 'axiomaowsdev',
		aadB2cClientId: '86cd36e9-2b38-4c66-90fa-304784a10339',
		aadB2cRedirectUri: 'http://localhost:5000',
		aadB2cScope: '86cd36e9-2b38-4c66-90fa-304784a10339 openid offline_access',
		aadB2cP: 'B2C_1_SignIn',
		aadB2cPasswordReset: 'B2C_1A_PASSWORDRESETACCOUNTEXISTS',
	};
	/** sandbox **/
	// _WealthConfig = {
	// 	wealthUrl: 'http://localhost:8124/batch',
	// 	// wealthUrl: 'http://20.12.84.91:8080/wealth-core',
	// 	aadB2cTenant: 'qontigowealthsandbox',
	// 	aadB2cClientId: 'd9fd1a28-a83d-4ca0-99ae-0928efd08c92',
	// 	aadB2cRedirectUri: 'http://localhost:5000',
	// 	aadB2cScope: 'd9fd1a28-a83d-4ca0-99ae-0928efd08c92 openid offline_access',
	// 	aadB2cP: 'B2C_1_SignIn',
	// 	aadB2cPasswordReset: 'B2C_1_Reset',
	// };
} else {
	if (IsProd) {
		// check Config has all fields populated during production
		_WealthConfig = Config as unknown as IWealthConfig;
	} else {
		_WealthConfig = {} as IWealthConfig;
		throw new Error('Unreachable');
	}
}

export const WealthConfig = _WealthConfig;
(window as typeof window & { WealthConfig: IWealthConfig }).WealthConfig = WealthConfig;