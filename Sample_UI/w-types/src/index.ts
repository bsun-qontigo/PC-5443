
import { IWealthWorkspaceSetting, StringToLuxonDateTime, ToLuxonDateTime } from '@axioma-api/wealth-utils';
import { WorkspaceController, TabState, LayoutSaveState } from '@axioma-framework/layout';
import { AccountRO, AnalyticsTSInputRO, AnalyticsTSResult, AssetAnalyticsRO, AssetSetRO, BatchJobRO, BatchOptimizationEntryOutputRO, BatchSharedDataRO, BatchStrategiesRO, BatchWorkspaceArchiveFileTaskStatusRO, ContentBuilderGroupRO, ContentBuilderScalarRO, CostModelRO, GroupRO, HoldingLotAnalyticsRO, InitialvsFinalAnalyticsRO, MetagroupRO, PortfolioDrillDownRO, RebalancingConfigurationRO, ScalarGroupingRO, StrategyRO, TradeAnalyticsRO, TransactionLotAnalyticsRO } from '@axioma/wealth-models';
import { DateTime } from 'luxon';
import { Option } from '@axioma/core';
import { Workbook, Worksheet, RowModel } from 'exceljs';

export type WealthAnalyticsTSInputRO = StringToLuxonDateTime<Exclude<AnalyticsTSInputRO, 'startDate' | 'endDate'>, { startDate: DateTime, endDate: DateTime }>;
export type WealthAnalyticsTSResult = StringToLuxonDateTime<Exclude<AnalyticsTSResult, 'rebalanceDate'>, { rebalanceDate?: DateTime }>;
export type DashboardHistogramChartField = 'trackingError' | 'realizedGainsYTD' | 'turnoverPercent';
export type WealthBatchStrategiesRO = StringToLuxonDateTime<BatchStrategiesRO, { date: DateTime | undefined }>;
export type WorkspaceStateController = WorkspaceController & { states: Array<WorkspaceState | WorkspaceTabState> };
// TODO merge with LayoutsState
export type WorkspaceState = { applicationName: string; } & LayoutSaveState<{ userSettings: IWealthWorkspaceSetting; tabs: Array<TabState>; }>;
export type WorkspaceTabState = { applicationName: string; content: JSONTypes };
export type PortfolioDrilldownState = { applicationName: string; conent: JSONTypes };

export type ExtendedBatchOptimizationEntryOutputRO = BatchOptimizationEntryOutputRO & { lastTrade?: Date; }
export type WealthExtendedBatchOptimizationEntryOutputRO = StringToLuxonDateTime<ExtendedBatchOptimizationEntryOutputRO, { date: DateTime | undefined, lastTrade: DateTime | undefined }>;
export type WealthBatchOptimizationJobRO = {
	batchName: string;
	status: 'Successful' | 'Error';
	percentCompleted: number;
	analysisDate: DateTime;
	marketDataTimestamp: DateTime;
	startTime: DateTime;
	lastUpdatedTime: DateTime;
	batchJobId: number;
	stratgeyId: string;
	createdBy: string;
};
export type WealthBatchJobRO = StringToLuxonDateTime<Exclude<BatchJobRO, 'createdAt' | 'batchDate'>, { createdAt?: DateTime; batchDate?: DateTime }>;

export type AppCloseRequest = { id: number; renderedModule: string }

export type AssetClassificationMap = Record<string, Record<GroupByKey, string>>;
export type UserSettingsMenuItem = 'logout' | 'settings' | 'reportBug' | 'processingStatus';
export type UserSettingsMenuItemState = 'close' | 'reset' | 'save';
export type WealthHoldingLotAnalyticsRO = StringToLuxonDateTime<HoldingLotAnalyticsRO, { buyDate?: DateTime }>;
export type WealthTransactionLotAnalyticsRO = StringToLuxonDateTime<TransactionLotAnalyticsRO, { buyDate?: DateTime }>;
export type WealthAssetAnalyticsRO = StringToLuxonDateTime<AssetAnalyticsRO, { holdingLotAnalytics?: Array<WealthHoldingLotAnalyticsRO> }> & { classifications?: Record<GroupByKey, string | null>; isUnclassified?: boolean };
export type WealthTradeAnalyticsRO = StringToLuxonDateTime<TradeAnalyticsRO, { transactionLotAnalytics?: Array<WealthTransactionLotAnalyticsRO> }>
export type WealthInitialvsFinalAnalyticsRO = InitialvsFinalAnalyticsRO & { classifications?: Record<GroupByKey, string | null>; isUnclassified?: boolean };
export type WealthPortfolioDrillDownRO = StringToLuxonDateTime<PortfolioDrillDownRO, { date?: DateTime, assetDetailsInitial?: Array<WealthAssetAnalyticsRO>, assetDetailsFinal?: Array<WealthAssetAnalyticsRO>, tradeDetails?: Array<WealthTradeAnalyticsRO>, classificationDTO?: ClassificationDTO }>;
type ClassificationLevel = { key?: string; name: string; i18nKey: string }
export type ClassificationDTO =
	| [{ key: 'level@1' } & ClassificationLevel]
	| [{ key: 'level@1' } & ClassificationLevel, { key: 'level@2' } & ClassificationLevel]
	| [{ key: 'level@1' } & ClassificationLevel, { key: 'level@2' } & ClassificationLevel, { key: 'level@3' } & ClassificationLevel]
	| [{ key: 'level@1' } & ClassificationLevel, { key: 'level@2' } & ClassificationLevel, { key: 'level@3' } & ClassificationLevel, { key: 'level@4' } & ClassificationLevel]
	| [{ key: 'level@1' } & ClassificationLevel, { key: 'level@2' } & ClassificationLevel, { key: 'level@3' } & ClassificationLevel, { key: 'level@4' } & ClassificationLevel, { key: 'level@5' } & ClassificationLevel]
	| [{ key: 'level@1' } & ClassificationLevel, { key: 'level@2' } & ClassificationLevel, { key: 'level@3' } & ClassificationLevel, { key: 'level@4' } & ClassificationLevel, { key: 'level@5' } & ClassificationLevel, { key: 'level@6' } & ClassificationLevel]
	;
export type GroupByKey = ClassificationDTO[number]['key'];

export type PortfolioTabState = {
	dashboardDate: Option<DateTime>;
	loading: boolean
	portfolioName: string;
	strategyName: string;
	rowData: WealthExtendedBatchOptimizationEntryOutputRO;
	portfolioData: Promise<WealthPortfolioDrillDownRO>;
	asOf: DateTime;
};

export type WealthGroupRO = StringToLuxonDateTime<GroupRO, {
	date?: DateTime;
}>;

export type WealthMetagroupRO = StringToLuxonDateTime<MetagroupRO, {
	date?: DateTime;
}>;

export type WealthContentBuilderGroupRO = StringToLuxonDateTime<ContentBuilderGroupRO, {
	date?: DateTime;
}>;

export type WealthContentBuilderScalarRO = StringToLuxonDateTime<ContentBuilderScalarRO, {
	date?: DateTime;
}>;
export type WealthScalarGroupingRO = StringToLuxonDateTime<ScalarGroupingRO, {
	date?: DateTime;
}>;
export type WealthCostModelRO = StringToLuxonDateTime<CostModelRO, {
	date?: DateTime;
}>;
export type WealthAssetSetRO = StringToLuxonDateTime<AssetSetRO, {
	date?: DateTime;
}>;
export type WealthStrategyRO = StringToLuxonDateTime<StrategyRO, {
	date?: DateTime;
}>;
export type WealthBatchSharedDataRO = StringToLuxonDateTime<BatchSharedDataRO, {
	groups?: Array<WealthGroupRO>,
	metagroups?: Array<WealthMetagroupRO>,
	contentBuilderGroups?: Array<WealthContentBuilderGroupRO>,
	contentBuilderScalars?: Array<WealthContentBuilderScalarRO>,
	scalarGroupings?: Array<WealthScalarGroupingRO>,
	costModels?: Array<WealthCostModelRO>,
	assetSets?: Array<WealthAssetSetRO>,
	strategy?: WealthStrategyRO
}>;

export type WealthAccountRO = StringToLuxonDateTime<AccountRO, {
	date?: DateTime;
}>
export type WealthRebalancingConfigurationRO = StringToLuxonDateTime<RebalancingConfigurationRO, {
	account?: WealthAccountRO;
}>;

export type WealthBatchWorkspaceArchiveFileTaskStatusRO = ToLuxonDateTime<BatchWorkspaceArchiveFileTaskStatusRO>;

export type ExcelDownloadRequest = {
	readonly props: Pick<Partial<Workbook>, 'category' | 'creator' | 'description' | 'keywords' | 'lastModifiedBy' | 'created' | 'manager' | 'modified' | 'lastPrinted' | 'properties' | 'subject' | 'title'>;
	readonly isMultiple?: boolean;
}

export type ICustomFormatting = { customFormatting: string[]; formatterNames: string[] }
export type IDataToExport = { data: string[][] | Partial<RowModel & { role: string }>[], headers: string[]; sheetHeaders?: string[] } & ICustomFormatting;

export interface IRowTracking {
	getter(): number;
	increment(): void
}

export type WorksheetRequest = {
	readonly key: string;
	readonly name: string | (() => string);
	readonly sheetHeaders?: Array<string | Date>;
	readonly data: IDataToExport;
	readonly eachRow?: (rowTracking: IRowTracking, worksheet: Worksheet, formatting: string[], formatterNames: string[], row: string[] | Partial<RowModel & { role: string }>, _index: number) => void;
}

export type SingleExcelDownloadRequest = WorksheetRequest & ExcelDownloadRequest & { isMultiple: false; };
export type MultipleExcelDownloadRequest = { sheets: WorksheetRequest[]; } & ExcelDownloadRequest & { isMultiple: true; };

export type Nullable<T> = T extends string | number | symbol /** more primitives */ ? T | null : {
	// no recursive for now
	[P in keyof T]: T[P] | null;
};

declare global {
	interface Window {
		electronAPI: {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			fetchRequest: any;
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			onUpdateCounter: any;
		}
	}
}