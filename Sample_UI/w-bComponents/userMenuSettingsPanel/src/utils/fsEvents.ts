import { tryEvent } from '@axioma-api/fs';
import { NumberFormat } from '@axioma-api/wealth-utils';

export function fsThemeChanged(theme: string): void {
	send('Theme_Changed_', theme);
}

export function fsDecimalDigitsChanged(number: string): void {
	send('Decimal_Digits_Changed_', number);
}

export function fsPercentDigitsChanged(number: string): void {
	send('Percent_Digits_Changed_', number);
}
export function fsBpsDigitsChanged(number: string): void {
	send('BPS_Digits_Changed_', number);
}

export function fsDecimalCurrencyChanged(number: string): void {
	send('Decimal_Currency_Changed_', number);
}

export function fsNumberFormatChanged(number: NumberFormat): void {
	send('Decimal_Currency_Changed_', `${number.culture}_${number.description}`);
}

export function fsUserSettingsClosed(): void {
	send('User_Settings_Closed');
}

export function fsUserSettingsReset(): void {
	send('User_Settings_Reset');
}

export function fsUserSettingsSaved(): void {
	send('User_Settings_Saved');
}

type Actions = 'User_Settings_Saved' | 'User_Settings_Reset' | 'User_Settings_Closed' | 'Decimal_Currency_Changed_' | 'BPS_Digits_Changed_' | 'Percent_Digits_Changed_' | 'Theme_Changed_' | 'Decimal_Digits_Changed_';

function send(action: Actions, extra?: string) {
	tryEvent('Wealth', { action: `${action}${extra}` });
}