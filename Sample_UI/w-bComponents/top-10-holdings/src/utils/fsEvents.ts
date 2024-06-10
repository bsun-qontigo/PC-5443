import { tryEvent } from '@axioma-api/fs';

export function fsDownloadExcel(): void {
	send('Top10Holdings_Download_Excel');
}

export function fsDownloadCSV(): void {
	send('Top10Holdings_Download_CSV');
}

type Actions = 'Top10Holdings_Download_Excel' | 'Top10Holdings_Download_CSV';

function send(action: Actions, extra?: string) {
	tryEvent('Wealth', { action: `${action}${extra}` });
}