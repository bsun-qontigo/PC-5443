import { EventEmitter } from 'events';
import { DateTime } from 'luxon';
import { MarketDataSource as _MarketDataSource } from '@axioma/api-models/sis';
export type StringToLuxonDateTime<T extends object, K1 extends object> = Omit<T, keyof K1> & K1;
export type RequiredKeys<T extends object | undefined> = Exclude<{
	[k in keyof T]-?: undefined extends T[k] ? never : k;
}[keyof T], 'number'>;
export type OptionalKeys<T extends object | undefined> = Exclude<keyof T, RequiredKeys<T>>;
export type ToLuxonDateTime<T> = T extends object ? {
	[KRequired in RequiredKeys<T>]: (T[KRequired] extends Date ? DateTime : (T[KRequired] extends Array<infer U> ? Array<ToLuxonDateTime<U>> : (T[KRequired] extends object ? ToLuxonDateTime<T[KRequired]> : T[KRequired])));
} & {
		[KOptional in OptionalKeys<T>]?: (T[KOptional] extends Date | undefined ? DateTime | undefined : (T[KOptional] extends Array<infer U> | undefined ? Array<ToLuxonDateTime<U>> | undefined : (T[KOptional] extends object | undefined ? ToLuxonDateTime<T[KOptional]> : T[KOptional])));
	} : T;
export interface IWealthWorkspaceSetting {
	theme?: string;
	decimalDigits: string;
	percentDigits: string;
	bpsDigits: string;
	decimalCurrencyValue: string;
	numberFormatValue: NumberFormat;
}
export interface NumberFormat {
	description: string;
	culture: string;
}

export type MarketDataSource = ToLuxonDateTime<MakeRequired<_MarketDataSource, 'id' | 'name'>>;
export declare const TINY_TIME = 1000;
export declare const SMALL_TIME = 10000;
export declare const MEDIUM_TIME = 30000;
export declare const LONG_TIME = 120000;
export declare const LONG_LONG_TIME = 1200000;

export type NumberFormatMode = 'decimal' | 'percent' | 'bps' | 'currency' | 'integer' | 'percent_no_symbol';

export type UserSettingsRegistry = {
	getFormatter(type: NumberFormatMode): (value: number) => string;
	getWorkspaceSettings<T extends Partial<IWealthWorkspaceSetting>>(): Promise<T>;
	getDefaultWorkspaceSettings<T extends Partial<IWealthWorkspaceSetting>>(): Promise<T>;
	getDefaultStaticWorkspaceSettings<T extends Partial<IWealthWorkspaceSetting>>(): T;
} & EventEmitter;

export const numberFormatValues = [
	{ description: '10,000.00', culture: 'en-US' },
	{ description: '10 000,00', culture: 'fr-FR' },
	{ description: '10.000,00', culture: 'de-DE' }
];

export const applicationJson = 'application/json';
export const applicationXml = 'application/xml';
type ContentType = typeof applicationJson | typeof applicationXml;
export function contentType(type: ContentType): Record<'Content-Type', ContentType> {
	return {
		'Content-Type': type
	};
}

export function getBody<T>(response: FetchResponse<T>): T {
	return response.body;
}

export async function streamToString(stream: ReadableStream<Uint8Array>): Promise<string> {
	return await new Response(stream).text();
 }