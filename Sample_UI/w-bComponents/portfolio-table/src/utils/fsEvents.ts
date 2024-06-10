import { tryEvent } from '@axioma-api/fs';
import { GroupByKey, Nullable } from '@axioma/wealth-types';

export function fsSelectInitial(): void {
	send('Selected_DrillDown_Initial');
}

export function fsSelectTradeList(): void {
	send('Selected_DrillDown_TradeList');
}

export function fsSelectInitialFinal(): void {
	send('Selected_DrillDown_Initial_Final');
}

export function fsSelectFinal(): void {
	send('Selected_DrillDown_Final');
}

export function fsSelectAssets(): void {
	send('Selected_DrillDown_Assets');
}

export function fsSelectLots(): void {
	send('Selected_DrillDown_Lots');
}

export function fsSingleDownload(): void {
	send('DrillDown_Downloaded_Single_Portfolio');
}

export function fsMultipleDownload(): void {
	send('DrillDown_Downloaded_Multiple_Portfolio');
}

export function fsCSVDownload(): void {
	send('DrillDown_Donloaded_CSV_Portfolio');
}

export function fsDownloadWorkspace(): void {
	send('DrillDown_Download_Workspace');
}

export function fsOpenDownloadPanel(): void {
	send('DrillDown_Open_Downloads_Panel');
}

export function fsSelectGroupBy(level: Nullable<GroupByKey>): void {
	if (level) {
		send(`Selected_GroupBy_${level}`);
	} else {
		send(`Selected_GroupBy_none`);
	}
}

type Actions = 'DrillDown_Download_Workspace' |
	'DrillDown_Donloaded_CSV_Portfolio' |
	'Selected_DrillDown_Initial' |
	'Selected_DrillDown_TradeList' |
	'Selected_DrillDown_Initial_Final' |
	'Selected_DrillDown_Final' |
	'Selected_DrillDown_Assets' |
	'Selected_DrillDown_Lots' |
	'DrillDown_Downloaded_Single_Portfolio' |
	'DrillDown_Downloaded_Multiple_Portfolio' |
	'DrillDown_Open_Downloads_Panel' |
	`Selected_GroupBy_${GroupByKey}` |
	`Selected_GroupBy_none`

function send(action: Actions, extra?: string) {
	tryEvent('Wealth', { action: `${action}${extra}` });
}