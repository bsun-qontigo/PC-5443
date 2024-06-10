import { GridApi, ColumnApi, CellEvent } from '@axioma-types/grid-wrapper';
import { ColumnState } from '@ag-grid-community/core';
import { WealthExtendedBatchOptimizationEntryOutputRO } from '@axioma/wealth-types';
import { DatepickerHandler } from '@axioma-framework/qontum';
import { PillsComponentParams } from './pills';
import { DateTime } from 'luxon';
import { Option } from '@axioma/core';

export type BatchResultsGridApi = GridApi<WealthExtendedBatchOptimizationEntryOutputRO> & { exportDataAsTradeList: (params: TradeListExportParams) => Promise<void>; exportDataAsWorkspace: (params: WorkspaceExportParams) => Promise<void> };
export type Context = {
	loading: boolean;
	isDownloadingTradeList: boolean;
	handlerSelectedDate: DatepickerHandler;
	handlerPill: PillsComponentParams['handler'];
	columnStatesMap: Record<string, ColumnState>;
	openDownloadPanel: () => void;
	strategyName: () => string;
	date: () => Option<DateTime>;
	gridApi: () => BatchResultsGridApi;
	columnApi: () => ColumnApi;
	driverSidebar: (event: CellEvent<WealthExtendedBatchOptimizationEntryOutputRO>) => void;
	element: () => HTMLElement;
	rowSelected: () => boolean;
	showErrors(data: WealthExtendedBatchOptimizationEntryOutputRO): void;
	closeErrorsPanel(): void;
	openPortfolioTab(rowData: WealthExtendedBatchOptimizationEntryOutputRO): void;
	workspaceDownload(): void;
}

export type ColumnExtraInfo = {
	supressExport?: boolean;
};

export type TradeListExportInitiator = Required<Pick<WealthExtendedBatchOptimizationEntryOutputRO, 'accountName'>>;
export type TradeListExportParams = {
	context: Context;
	zipFilename: string;
	initiators: TradeListExportInitiator[];
	onlySelected?: boolean;
}

type ContextField = 'strategyName' | 'accountName' | 'benchmarkName' | 'date' | 'log' | 'status';
export type WorkspaceExportInitiator = Required<Pick<WealthExtendedBatchOptimizationEntryOutputRO, 'workspaceId'>>
	& { optimizationContext: Pick<WealthExtendedBatchOptimizationEntryOutputRO, ContextField> }
	& ({ status?: 'rejected'; reason?: unknown; } | { status?: 'error'; error?: unknown; } | { status?: 'succeeded'; });
export type WorkspaceExportParams = {
	context: Context;
	zipFilename: string;
	initiators: WorkspaceExportInitiator[];
	onlySelected?: boolean;
}
