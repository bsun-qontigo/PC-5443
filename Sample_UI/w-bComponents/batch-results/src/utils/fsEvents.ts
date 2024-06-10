import { tryEvent } from '@axioma-api/fs';

export function fsHighlight(): void {
	send('Batch_Highlight_Clicked');
}

export function fsHistogramClicked(field: string): void {
	send('Histogram_Clicked_', field);
}

export function fsKeyMetricClickHandler(metric: string): void {
	send('Key_Metric_Clicked_', metric);
}

export function fsShowDrivers(): void {
	send('Show_Batch_Drivers');
}

export function fsCloseDrivers(): void {
	send('Close_Batch_Drivers');
}

export function fsShowErrors(): void {
	send('Show_Batch_Errors');
}

export function fsCloseErrors(): void {
	send('Close_Batch_Errors');
}

export function fsFilterChanged(): void {
	send('Batch_Filter_Change');
}

export function fsFilterRemoved(): void {
	send('Batch_Filter_Removed');
}

export function fsDownloadExcel(): void {
	send('Batch_Download_Excel');
}

export function fsDownloadCSV(): void {
	send('Batch_Download_CSV');
}

export function fsDownloadWorkspace(): void {
	send('Batch_Download_Workspace');
}

export function fsDownloadTradeList(): void {
	send('Batch_Download_TradeList');
}

export function fsOpenDrillDown(): void {
	send('Batch_Open_DrillDown');
}

export function fsOpenDownloadPanel(): void {
	send('Batch_Open_Downloads_Panel');
}

type Actions = 'Batch_Open_Downloads_Panel' | 'Batch_Open_DrillDown' | 'Batch_Download_TradeList' | 'Batch_Download_Workspace' | 'Batch_Download_CSV' | 'Batch_Download_Excel' | 'Close_Batch_Errors' | 'Close_Batch_Drivers' | 'Batch_Filter_Removed' | 'Batch_Filter_Change' | 'Show_Batch_Errors' | 'Show_Batch_Drivers' | 'Key_Metric_Clicked_' |'Batch_Highlight_Clicked' | 'Histogram_Clicked_';

function send(action: Actions, extra?: string) {
	tryEvent('Wealth', { action: `${action}${extra}` });
}