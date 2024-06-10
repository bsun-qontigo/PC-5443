import { tryEvent } from '@axioma-api/fs';

export function fsProcessingStatusClose(): void {
	send('Processing_Status_Close');
}

type Actions = 'Processing_Status_Close';

function send(action: Actions) {
	tryEvent('Wealth', { action });
}