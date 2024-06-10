import { tryEvent } from '@axioma-api/fs';

export function fsStratTabChange(): void {
	send('Strat_Tab_Change');
}

export function fsLogout(): void {
	send('Logout');
}


type Actions = 'Logout' | 'Strat_Tab_Change';

function send(action: Actions) {
	tryEvent('Wealth', { action });
}