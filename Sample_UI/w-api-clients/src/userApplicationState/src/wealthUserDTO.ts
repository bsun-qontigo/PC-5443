export type UserJWT = {
	aud: string,
	azp: string,
	emails: string[],
	exp: string,
	iat: string,
	iss: string,
	name: string,
	nbf: string,
	sub: string,
	tfp: string,
	ver: string
}
export class WealthUserDTO implements UserJWT {
	public readonly aud: string;
	public readonly azp: string;
	public readonly emails: string[];
	public readonly exp: string;
	public readonly iat: string;
	public readonly iss: string;
	public readonly name: string;
	public readonly nbf: string;
	public readonly sub: string;
	public readonly tfp: string;
	public readonly ver: string;

	public constructor(private readonly user: UserJWT) {
		this.aud = user.aud;
		this.azp = user.azp;
		this.emails = user.emails;
		this.exp = user.exp;
		this.iat = user.iat;
		this.iss = user.iss;
		this.name = user.name;
		this.nbf = user.nbf;
		this.sub = user.sub;
		this.tfp = user.tfp;
		this.ver = user.ver;
	}
}
