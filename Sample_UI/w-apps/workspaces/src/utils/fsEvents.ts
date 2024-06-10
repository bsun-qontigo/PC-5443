import { tryEvent } from '@axioma-api/fs';

export function fsOpenApp(appName: string): void {
	send('Open_App_', appName);
}

export function fsOpenHome(): void {
	send('Open_Home');
}

export function fsTheme(theme: string): void {
	send('Theme_', theme);
}

type Actions = 'Open_App_' | 'Open_Home' | 'Theme_';

function send(action: Actions, extra?: string) {
	tryEvent('Wealth', { action: `${action}${extra}` });
}