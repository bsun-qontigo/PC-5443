import { tryEvent } from '@axioma-api/fs';

export function fsShowErrors(): void {
	send('Show_ProcStatus_Errors');
}

export function fsCloseErrors(): void {
	send('Close_ProcStatus_Errors');
}

type Actions = 'Close_ProcStatus_Errors' | 'Show_ProcStatus_Errors';

function send(action: Actions, extra?: string) {
	tryEvent('Wealth', { action: `${action}${extra}` });
}