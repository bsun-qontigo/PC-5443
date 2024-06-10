import { Component, Vue, Prop, ChildHandler, ParentHandler, createTwoWayBinding, OneWayExpectations } from '@axioma/vue';
import VueTemplate from './template.vue';
import en from './assets/en';
import { plugins } from '@axioma/common';
import { createGrid } from './grid';
import { GridApi, ColumnApi } from '@axioma-types/grid-wrapper';
import { DateTime } from 'luxon';
import { WealthAssetAnalyticsRO, WealthPortfolioDrillDownRO } from '@axioma/wealth-types';
import { Context, Top10Holdings } from './type';
import { Option } from '@axioma/core';
import SpaceViewSelector, { WealthDataSpace, WealthDataView, SpaceViewSelectorHandler } from '@axioma-components/wealth-space-view-selector';

plugins.lang.mergeLocaleMessage('en', en);

export type Top10HoldingsExpectations = OneWayExpectations<{
	analysisDate?: DateTime;
	portfolioData: Promise<WealthPortfolioDrillDownRO>;
	dashboardDate: () => Option<DateTime>;
	loading: boolean;
}, {}>;

@Component({
	name: 'wealth-top-10-holdings',
	packageName: '@axioma-components/wealth-top-10-holdings',
	components: {
		SpaceViewSelector
	}
})
export default class Top10HoldingsComponent extends Vue.extend(VueTemplate) {
	@Prop({
		type: Object,
		required: true
	})
	protected handler!: ChildHandler<Top10HoldingsExpectations>;

	public gridApi!: GridApi<Top10Holdings>;
	public columnApi!: ColumnApi;
	protected spaceViewSelectorHandler!: ParentHandler<SpaceViewSelectorHandler>;
	protected dupAssets!: Map<string, boolean>;
	private selectedSpace: WealthDataSpace = 'total';
	private selectedView: WealthDataView = 'final';

	protected created(): void {
		this.spaceViewSelectorHandler = createTwoWayBinding<SpaceViewSelectorHandler>()
			.on('onSpaceChanged', (ev) => {
				this.selectedSpace = ev;
				this.handler.portfolioData().then(this.update);
			})
			.on('onViewChanged', (ev) => {
				this.selectedView = ev;
				this.handler.portfolioData().then(this.update);
			})
			.create();
	}

	protected mounted(): void {
		createGrid(this, {
			context: this.getContext(),
			elm: this.$refs.table as HTMLElement
		})
			.then(e => {
				this.gridApi = e.api;
				this.columnApi = e.columnApi;
				this.gridApi.showLoadingOverlay();
				this.$watch(this.handler.portfolioData, r => {
					if (!this.handler.loading()) {
						r.then(this.update);
					} else {
						this.gridApi.showLoadingOverlay();
					}
				}, { immediate: true });
			});
		this.onDestroy(() => {
			this.gridApi?.destroy();
		});
	}

	protected getContext(): Context {
		return {
			loading: this.handler.loading(),
			gridApi: () => this.gridApi,
			columnApi: () => this.columnApi,
			portfolioData: () => this.handler.portfolioData(),
			view: () => this.selectedView,
			type: () => this.selectedSpace,
			dupAssets: () => this.dupAssets,
		};
	}

	protected update(d: WealthPortfolioDrillDownRO): void {
		if (!d.assetDetailsFinal) {
			this.spaceViewSelectorHandler.child.then(x => {
				x.setDisableViewSelector(true);
				x.setSelectedView('initial');
				x.setViewValues(['initial']);
			});
			this.selectedView = 'initial';
		}
		const top10 = this.getTopN(d).map<Top10Holdings>(d => ({
			assetId: d.assetId as string,
			description: d.description as string,
			allocation: d[getField(this.selectedSpace)] as number
		}));
		this.dupAssets = new Map();

		top10.forEach(entry => {
			if (this.dupAssets.has(entry.description)) {
				this.dupAssets.set(entry.description, true);
			} else {
				this.dupAssets.set(entry.description, false);
			}
		});
		this.fillGrid(top10);
	}

	private fillGrid(data: Top10Holdings[]): void {
		if (data.length > 0) {
			this.gridApi.hideOverlay();
			this.gridApi.setRowData(data);
		} else {
			this.gridApi.showNoRowsOverlay();
			this.gridApi.setRowData([]);
		}
	}

	private getTopN(d: WealthPortfolioDrillDownRO, n = 10): Array<WealthAssetAnalyticsRO> {
		return getTopN(d, this.selectedView, this.selectedSpace, n);
	}

}

// helper functions which will be used for downloader in the future
export function getTopN(d: WealthPortfolioDrillDownRO, selectedView: WealthDataView, selectedSpace: WealthDataSpace, n = 10): Array<WealthAssetAnalyticsRO> {
	const data = getData(d, selectedView) ?? [] as unknown as Array<WealthAssetAnalyticsRO>;
	const field = getField(selectedSpace);
	const value = (d: WealthAssetAnalyticsRO): number => d[field] ?? 0;
	data.sort((a, b) => (value(b) - value(a)));
	return data.slice(0, n);
}

function getData(d: WealthPortfolioDrillDownRO, selectedView: WealthDataView): WealthAssetAnalyticsRO[] {
	if (selectedView === 'final') {
		return d.assetDetailsFinal ?? [];
	} else {
		return d.assetDetailsInitial ?? [];
	}
}

export function getField(selectedSpace: WealthDataSpace): 'weightPct' | 'activeWeightPct' {
	let field: keyof WealthAssetAnalyticsRO;
	if (selectedSpace === 'total') {
		field = 'weightPct';
	} else {
		field = 'activeWeightPct';
	}
	return field;
}