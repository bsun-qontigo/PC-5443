interface ISwaggerInfo {
	url: string;
	auth?: IAuthenticationInfo;
}

interface IAuthenticationInfo {
	opts: import('request').CoreOptions;
	authUrl: string;
}