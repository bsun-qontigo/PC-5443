import { AssetAnalyticsRO } from '@axioma/wealth-models';
import { GridApi, ColumnApi } from '@axioma-types/grid-wrapper';
import { WealthPortfolioDrillDownRO } from '@axioma/wealth-types';
import { WealthDataSpace, WealthDataView } from '@axioma-components/wealth-space-view-selector';

export type Top10Holdings = {
	assetId: AssetAnalyticsRO['assetId'] & string;
	description: AssetAnalyticsRO['description'] & string;
	allocation: AssetAnalyticsRO['weightPct'] & number;
}

export type Context = {
	loading: boolean;
	portfolioData: () => Promise<WealthPortfolioDrillDownRO>;
	gridApi: () => GridApi<Top10Holdings>;
	columnApi: () => ColumnApi;
	type: () => WealthDataSpace;
	view: () => WealthDataView;
	dupAssets: () => Map<string, boolean>;
}