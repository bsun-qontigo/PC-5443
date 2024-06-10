import { tryEvent } from '@axioma-api/fs';

export function fsUserSettingLogout(): void {
	send('User_Setting_Logout');
}

export function fsUserSettingReportBug(): void {
	send('User_Setting_Report_Bug');
}

export function fsUserSettingProcessingStatus(): void {
	send('User_Setting_Processing_Status');
}

export function fsUserSettingsSettingsClicked(): void {
	send('User_Setting_Settings_Clicked');
}


type Actions = 'User_Setting_Settings_Clicked' | 'User_Setting_Processing_Status' | 'User_Setting_Logout' | 'User_Setting_Report_Bug';

function send(action: Actions, extra?: string) {
	tryEvent('Wealth', { action: `${action}${extra}` });
}