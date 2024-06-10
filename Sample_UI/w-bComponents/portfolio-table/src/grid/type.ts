import { ColumnState } from '@ag-grid-community/core';
import { GridApi, ColumnApi, GridReadyEvent, ColDef } from '@axioma-types/grid-wrapper';
import { DateTime } from 'luxon';
import { Option } from '@axioma/core';
import { DatepickerHandler, ToggleButtonExpectations } from '@axioma-framework/qontum';
import { ParentHandler } from '@axioma/vue';
import { GroupByKey, Nullable, WealthAssetAnalyticsRO, WealthHoldingLotAnalyticsRO, WealthInitialvsFinalAnalyticsRO, WealthPortfolioDrillDownRO, WealthTradeAnalyticsRO, WealthTransactionLotAnalyticsRO } from '@axioma/wealth-types';
import { GridTypeToggleType } from '@axioma/wealth-commons';

export const LotsSelectorToggle = ['positions', 'taxLots'] as const;
export type GridLotsSelectorToggle = typeof LotsSelectorToggle[number];

export type Context = {
	gridApi: () => GridApi<WealthAssetAnalyticsRO>;
	date: () => Option<DateTime>;
	columnApi: () => ColumnApi;
	loading: () => boolean;
	columnStatesMap: Record<string, ColumnState>;
	element: () => HTMLElement;
	handlerSelectedDate: DatepickerHandler;
	toggleButton: ParentHandler<ToggleButtonExpectations<GridTypeToggleType>>;
	toggleButtonSlots: ParentHandler<ToggleButtonExpectations<GridLotsSelectorToggle>>;
	strategyName: () => string;
	portfolioData: () => Promise<WealthPortfolioDrillDownRO>;
	riskModel: () => string;
	gridType: () => GridTypeToggleType;
	gridLotsType: () => GridLotsSelectorToggle;
	gridReadyEvent: () => Promise<GridReadyEvent<WealthAssetAnalyticsRO>>;
	workspaceDownload(): void;
	changeGroupBy(e: Nullable<GroupByKey>): void;
	selectedGroupBy(): Nullable<GroupByKey>;
}
export type WealthLotsAnalyticsRO = WealthHoldingLotAnalyticsRO | WealthTransactionLotAnalyticsRO;
export type WealthAssetTypeAnalyticsRO = WealthAssetAnalyticsRO | WealthTradeAnalyticsRO | WealthInitialvsFinalAnalyticsRO;
export type WealthAnalyticsRO = WealthAssetTypeAnalyticsRO | WealthLotsAnalyticsRO;

export type WealthLotsAnalyticsROColDefs = ColDef<WealthHoldingLotAnalyticsRO>[] | ColDef<WealthTransactionLotAnalyticsRO>[];
export type WealthAssetOrTradeAnalyticsROColDefs = ColDef<WealthAssetAnalyticsRO>[] | ColDef<WealthTradeAnalyticsRO>[];
export type WealthAnalyticsColDefs = WealthLotsAnalyticsROColDefs | WealthAssetOrTradeAnalyticsROColDefs;

export type WealthLotsAnalyticsROArray = WealthLotsAnalyticsRO[] | WealthAssetTypeAnalyticsRO[];
export type WealthAssetTypeAnalyticsROArray = WealthAssetAnalyticsRO[] | WealthTradeAnalyticsRO[] | WealthInitialvsFinalAnalyticsRO[];
export type WealthAnalyticsROArray = WealthLotsAnalyticsROArray | WealthAssetTypeAnalyticsROArray;

export type AnalyticsSupportLots = WealthAssetAnalyticsRO | WealthTradeAnalyticsRO;
export type SupportLotsType = Exclude<GridTypeToggleType, 'initialFinal'>;