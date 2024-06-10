import { Component, Vue, Inject, Prop, ChildHandler, OneWayExpectations, ParentHandler, createOneWayBinding } from '@axioma/vue';
import VueTemplate from './template.vue';
import en from './assets/en';
import { plugins } from '@axioma/common';
import { TabItem } from '@axioma-framework/layout';
import { DateTime } from 'luxon';
import { Option, Debouncer, notificationsService } from '@axioma/core';
import { ClassificationDTO, GroupByKey, Nullable, WealthAssetAnalyticsRO, WealthInitialvsFinalAnalyticsRO, WealthPortfolioDrillDownRO } from '@axioma/wealth-types';
import type { GridApi, ColumnApi, GridReadyEvent } from '@axioma-types/grid-wrapper';
import { GridHelpers } from '@axioma-framework/grid-wrapper';
import { ColumnVisibleEvent, ColumnState, ColumnEvent } from '@ag-grid-community/core';
import { Context, GridLotsSelectorToggle, LotsSelectorToggle, SupportLotsType, WealthAnalyticsRO, WealthLotsAnalyticsRO, WealthLotsAnalyticsROColDefs, WealthAssetTypeAnalyticsRO, WealthAssetTypeAnalyticsROArray, WealthAssetOrTradeAnalyticsROColDefs } from './grid/type';
import { createGrid } from './grid';
import { DatepickerHandler, ToggleButtonExpectations } from '@axioma-framework/qontum';
import { Events } from '@ag-grid-community/all-modules';
import { GridTypeToggle, GridTypeToggleType, Unclassified } from '@axioma/wealth-commons';
import { fsSelectAssets, fsSelectFinal, fsSelectInitial, fsSelectInitialFinal, fsSelectLots, fsSelectTradeList } from './utils/fsEvents';
import { gridColumns, initialFinalColumns, lotsGridColumns, tradeListColumns, tradeListLotsColumns, createAssetColumns, prepareColDefForCsvExport, getGroupingHeaderName, toggleAggColumns } from './grid/column';
import { generateLotsAnalytics, generateAssetAnalytics, isGroupingColumn } from './grid/downloaders/helper';
import { wealthWorkspaceClientRegistry } from '@axioma-api/wealth-workspace';
import { wealthTaskClientRegistry } from '@axioma-api/wealth-task';
import * as fileSaver from 'file-saver';
import { getLevelName, getLevelDepth } from '@axioma-api/wealth-drilldown';

plugins.lang.mergeLocaleMessage('en', en);

export type PortfolioTableGridLayoutState = { columns: ColumnState[] }

export type PortfolioTableExpectations = OneWayExpectations<{
	strategyName: string;
	dashboardDate: Option<DateTime>;
	portfolioData: Promise<WealthPortfolioDrillDownRO>;
	loading: boolean;
	rootElm: HTMLElement;
}, {}>;

@Component({
	name: 'wealth-portfolio-table',
	packageName: '@axioma-components/portfolio-table',
	components: {
	}
})
export default class PortfolioTable extends Vue.extend(VueTemplate) {
	@Inject()
	protected layoutTabItem!: TabItem;

	@Prop({
		type: Object,
		required: true
	})
	protected handler!: ChildHandler<PortfolioTableExpectations>;

	protected gridApi!: GridApi<WealthAnalyticsRO>;
	protected columnApi!: ColumnApi;
	protected gridReadyEvent!: Promise<GridReadyEvent<WealthAnalyticsRO>>;
	protected handlerSelectedDate = null as unknown as DatepickerHandler;
	protected toggleButton = null as unknown as ParentHandler<ToggleButtonExpectations<GridTypeToggleType>>;
	protected toggleButtonSlots = null as unknown as ParentHandler<ToggleButtonExpectations<GridLotsSelectorToggle>, 'values'>;
	protected columnStatesMap!: Record<string, ColumnState>;
	protected selectedGridType: GridTypeToggleType = 'final';
	protected selectedGridLotsType: GridLotsSelectorToggle = 'positions';
	protected selectedGroupBy: Nullable<GroupByKey> = null;
	protected riskModel = '';

	protected created(): void {
		this.createSelectedDateHandler();
		this.createToggleButtonHandler();
		this.createToggleButtonSlotsHandler();
	}

	protected mounted(): void {
		let ev: ColumnEvent;
		const _columnVisibleChanged = () => this.updateGridState(ev.columnApi.getColumnState());
		const debouncerTime = 0;
		const debouncerForColumn = new Debouncer(debouncerTime, _columnVisibleChanged);
		const columnVisibleChanged = (e: ColumnVisibleEvent) => {
			ev = e;
			debouncerForColumn.tick();
		};
		this.gridReadyEvent = createGrid(
			this, {
			context: this.getContext(),
			elm: this.$refs.table as HTMLElement
		});

		this.gridReadyEvent.then(e => {
			this.gridApi = e.api;
			this.gridApi.showLoadingOverlay();
			this.columnApi = e.columnApi;
			this.gridApi.addEventListener(Events.EVENT_COLUMN_VISIBLE, columnVisibleChanged);
			const colDefs = GridHelpers.getColDefsByHandleOptions(gridColumns(), e);
			const key: string = this.handler.strategyName();
			const state = (this.layoutTabItem.getState<Array<WealthAnalyticsRO>, { portfolioTableGrid: PortfolioTableGridLayoutState }>(key) || {}) as { portfolioTableGrid: PortfolioTableGridLayoutState };
			const portfolioTableGridState: PortfolioTableGridLayoutState = state.portfolioTableGrid || {} as PortfolioTableGridLayoutState;
			if (portfolioTableGridState.columns) {
				colDefs.forEach(c => {
					c.hide = (portfolioTableGridState.columns.find(s => s.colId === c.colId)?.hide) === true;
				});
			}
			this.gridApi.setColumnDefs(colDefs);
			this.$watch(this.handler.portfolioData, (r) => {
				if (!this.handler.loading()) {
					r.then(this.update);
				} else {
					this.gridApi.showLoadingOverlay();
				}
			}, { immediate: true });
		})
			.then(() => {
				this.gridReadyEvent.then(e => {
					const colDefs = GridHelpers.getColDefsByHandleOptions(gridColumns(), e);
					const key: string = this.handler.strategyName();
					const state = (this.layoutTabItem.getState<Array<WealthAnalyticsRO>, { portfolioTableGrid: PortfolioTableGridLayoutState }>(key) ?? {}) as { portfolioTableGrid: PortfolioTableGridLayoutState };
					state.portfolioTableGrid = state.portfolioTableGrid || {} as PortfolioTableGridLayoutState;
					if (state.portfolioTableGrid.columns) {
						colDefs.forEach(c => {
							c.hide = (state.portfolioTableGrid.columns.find(s => s.colId === c.colId)?.hide) === true;
						});
					}
					this.gridApi.setColumnDefs(colDefs);
				});
			});

		this.onDestroy(() => {
			this.gridApi.removeEventListener(Events.EVENT_COLUMN_VISIBLE, columnVisibleChanged);
		});
	}

	protected removefilter(): void {
		this.gridApi.setFilterModel(null);
	}

	protected getContext(): Context {
		return {
			gridApi: () => this.gridApi,
			date: () => this.handler.dashboardDate(),
			columnApi: () => this.columnApi,
			loading: this.handler.loading,
			columnStatesMap: this.columnStatesMap,
			element: () => this.handler.rootElm(),
			handlerSelectedDate: this.handlerSelectedDate,
			toggleButton: this.toggleButton,
			toggleButtonSlots: this.toggleButtonSlots,
			strategyName: () => this.handler.strategyName(),
			portfolioData: () => this.handler.portfolioData(),
			riskModel: () => this.riskModel,
			gridType: () => this.selectedGridType,
			gridLotsType: () => this.selectedGridLotsType,
			gridReadyEvent: () => this.gridReadyEvent,
			selectedGroupBy: () => this.selectedGroupBy,
			workspaceDownload: this.workspaceDownload,
			changeGroupBy: this.onGroupByChanged,
		};
	}

	private onGroupByChanged(groupBy: Nullable<GroupByKey>): void {
		this.selectedGroupBy = groupBy;
		this.handler.portfolioData().then(this.update);
	}

	private workspaceDownload(): void {
		this.handler.portfolioData()
			.then(data => {
				if (data.strategyName && data.date)
					wealthTaskClientRegistry.getResultsByStrategyNameAndDate(data.strategyName, data.date)
						.then(res => {
							const found = res.find(i => i.accountName === data.identity);
							if (found) {
								const { workspaceId, strategyName, accountName } = found;
								if (workspaceId) {
									wealthWorkspaceClientRegistry.getWorkspaceBy({
										date: data.date as DateTime,
										strategy: strategyName as string,
										portfolio: accountName as string,
										workspaceId: workspaceId
									})
										.then(data => {
											const blob = new Blob([data], { type: 'xml' });
											fileSaver.saveAs(blob, `${workspaceId}.xml`);
											notificationsService.notificationsServiceRegistry.successToast({ title: this.$t('BATCH_RESULTS.DOWNLOAD_WORKSPACE') });
										})
										.catch(e => notificationsService.notificationsServiceRegistry.notifyHttpErrors(e));
								}
							}
						}).catch(e => notificationsService.notificationsServiceRegistry.notifyHttpErrors(e));
			});
	}

	private onGridTypeChange(type: GridTypeToggleType): void {
		this.selectedGridType = type;
		if (type === 'original') {
			fsSelectInitial();
			this.toggleButtonSlots.setters.values(LotsSelectorToggle as unknown as Array<GridLotsSelectorToggle>);
		} else if (type === 'tradeList') {
			fsSelectTradeList();
			this.toggleButtonSlots.setters.values(LotsSelectorToggle as unknown as Array<GridLotsSelectorToggle>);
		} else if (type === 'initialFinal') {
			fsSelectInitialFinal();
			this.selectedGridLotsType = 'positions';
			this.toggleButtonSlots.setters.values([LotsSelectorToggle.find(v => v === this.selectedGridLotsType) as GridLotsSelectorToggle]);
		} else {
			fsSelectFinal();
			this.toggleButtonSlots.setters.values(LotsSelectorToggle as unknown as Array<GridLotsSelectorToggle>);
		}
		this.handler.portfolioData().then(data => this.update(data));
	}

	private onGridToSlotsTypeChange(type: GridLotsSelectorToggle): void {
		this.selectedGridLotsType = type;
		if (type === 'positions') {
			fsSelectAssets();
		} else {
			fsSelectLots();
		}
		this.handler.portfolioData().then(data => this.update(data));
	}

	private getTableData(pfData: WealthPortfolioDrillDownRO): WealthAssetTypeAnalyticsROArray | undefined {
		return generateAssetAnalytics(this.selectedGridType, pfData);
	}

	private update(portfolioData: WealthPortfolioDrillDownRO): void {
		this.riskModel = portfolioData.riskModelName as string;
		if (!portfolioData.assetDetailsFinal && portfolioData.identity) {
			this.toggleButton.values = () => ['original'];
			this.toggleButton.disabled = () => true;
			this.selectedGridType = 'original';
		}

		let data = this.getTableData(portfolioData);
		if (this.selectedGridLotsType === 'taxLots' && data) {
			data = generateLotsAnalytics(this.selectedGridType as SupportLotsType, portfolioData);
			this.setupLotsGrid(data, portfolioData.classificationDTO as ClassificationDTO);
		} else {
			this.setupAssetsGrid(data, portfolioData.classificationDTO as ClassificationDTO);
		}
	}

	private setupLotsGrid(data: WealthLotsAnalyticsRO[], classificationDTO: ClassificationDTO): void {
		this.gridReadyEvent.then(e => {
			let colDefs: WealthLotsAnalyticsROColDefs;
			if (this.selectedGridType === 'tradeList') {
				colDefs = GridHelpers.getColDefsByHandleOptions(tradeListLotsColumns(), e);
			} else if (this.selectedGridType === 'initialFinal') {
				throw new Error('wrong type');
			} else {
				colDefs = GridHelpers.getColDefsByHandleOptions(lotsGridColumns(), e);
				// TODO remove
				const key: string = this.handler.strategyName() + 'lots';
				const state = (this.layoutTabItem.getState<WealthPortfolioDrillDownRO, { portfolioTableGrid: PortfolioTableGridLayoutState }>(key) || {}) as { portfolioTableGrid: PortfolioTableGridLayoutState };
				const portfolioTableGridState: PortfolioTableGridLayoutState = state.portfolioTableGrid || {} as PortfolioTableGridLayoutState;
				if (portfolioTableGridState.columns) {
					colDefs.forEach(c => {
						c.hide = (portfolioTableGridState.columns.find(s => s.colId === c.colId)?.hide) === true;
					});
				}
			}
			this.setColumnDefs(colDefs, classificationDTO, false);
			setTimeout(() => this.fillGrid(data || []));
		});
	}

	private setupAssetsGrid(data: WealthAssetTypeAnalyticsRO[] | undefined, classificationDTO: ClassificationDTO): void {
		this.gridReadyEvent.then(e => {
			let colDefs: WealthAssetOrTradeAnalyticsROColDefs;
			if (this.selectedGridType === 'tradeList') {
				colDefs = GridHelpers.getColDefsByHandleOptions(tradeListColumns(), e);
			} else if (this.selectedGridType === 'initialFinal') {
				const columns = createAssetColumns(this.getContext(), initialFinalColumns(), this.selectedGroupBy, classificationDTO);
				colDefs = GridHelpers.getColDefsByHandleOptions(columns, e);
			} else {
				const columns = createAssetColumns(this.getContext(), gridColumns(), this.selectedGroupBy, classificationDTO);
				colDefs = GridHelpers.getColDefsByHandleOptions(columns, e);
				// TODO remove
				const key: string = this.handler.strategyName();
				const state = (this.layoutTabItem.getState<WealthPortfolioDrillDownRO, { portfolioTableGrid: PortfolioTableGridLayoutState }>(key) || {}) as { portfolioTableGrid: PortfolioTableGridLayoutState };
				const portfolioTableGridState: PortfolioTableGridLayoutState = state.portfolioTableGrid || {} as PortfolioTableGridLayoutState;
				if (portfolioTableGridState.columns) {
					colDefs.forEach(c => {
						c.hide = (portfolioTableGridState.columns.find(s => s.colId === c.colId)?.hide) === true;
					});
				}
			}
			const isGroupByMode = this.selectedGroupBy && this.selectedGridType !== 'tradeList';
			this.setColumnDefs(colDefs, classificationDTO, isGroupByMode);
			this.setupUnclassified(data, classificationDTO);
			setTimeout(() => this.fillGrid(data || []));
		});
	}

	private setColumnDefs(colDefs: WealthAssetOrTradeAnalyticsROColDefs, classificationDTO: ClassificationDTO, isGroupByMode: boolean | null): void {
		toggleAggColumns(isGroupByMode, colDefs, classificationDTO.map(c => c.key));
		colDefs.forEach(c => {
			if (isGroupingColumn(c)) {
				c.headerName = getGroupingHeaderName(isGroupByMode);
			}
			prepareColDefForCsvExport(c);
		});
		this.setAutoGroupColumnDef(isGroupByMode);
		this.gridApi.setColumnDefs(colDefs);
	}

	private setAutoGroupColumnDef(isGroupByMode: boolean | null): void {
		if (isGroupByMode) {
			this.gridApi.setAutoGroupColumnDef({
				field: 'assetId',
				headerName: getGroupingHeaderName(isGroupByMode),
				resizable: true,
				minWidth: 200,
				sortable: true,
				tooltipValueGetter: (d) => {
					if (d.node?.group) {
						return [this.riskModel, d.value].join('.');
					} else {
						return d.value;
					}

				}
			});
		} else {
			this.gridApi.setAutoGroupColumnDef({});
		}
	}

	private fillGrid(data: WealthAssetTypeAnalyticsRO[]): void {
		if (data.length > 0) {
			this.gridApi.hideOverlay();
			this.gridApi.setRowData(data);
		} else {
			this.gridApi.showNoRowsOverlay();
			this.gridApi.setRowData([]);
		}
		this.columnApi.autoSizeAllColumns();
	}

	private updateGridState(colDefs: GridColumnStatePersist[]): void {
		const key: string = this.handler.strategyName();
		this.layoutTabItem.setState<unknown, { portfolioGrid: WealthPortfolioDrillDownRO }>(key, {
			... this.layoutTabItem.getState<unknown, { portfolioGrid: WealthPortfolioDrillDownRO }>(key), ...{
				portfolioTableGrid: {
					columns: colDefs.filter(c => c.hide).map(c => ({
						colId: c.colId,
						hide: c.hide
					}))
				}
			}
		});
	}

	private createSelectedDateHandler(): void {
		this.handlerSelectedDate = {
			value: this.handler.dashboardDate(),
			clearable: false,
			disabled: true,
			onChange: value => {
				this.handlerSelectedDate.value = value;
			}
		};
	}

	private createToggleButtonHandler(): void {
		this.toggleButton = createOneWayBinding<ToggleButtonExpectations<GridTypeToggleType>>()
			.byRef('values', () => GridTypeToggle as unknown as Array<GridTypeToggleType>)
			.byRef('disabled', () => undefined)
			.byRef('options', () => {
				return {
					label: (value) => {
						switch (value) {
							case 'original':
								return this.$t('PORTFOLIO_TABLE.ORIGINAL').toString();
							case 'tradeList':
								return this.$t('PORTFOLIO_TABLE.TRADE_LIST').toString();
							case 'initialFinal':
								return this.$t('PORTFOLIO_TABLE.INITIAL_FINAL').toString();
							case 'final':
							default:
								return this.$t('PORTFOLIO_TABLE.FINAL').toString();
						}
					},
					selected: (value) => value === this.selectedGridType,
				};
			})
			.on('onClick', (ev) => this.onGridTypeChange(ev))
			.create();
	}

	private createToggleButtonSlotsHandler(): void {
		this.toggleButtonSlots = createOneWayBinding<ToggleButtonExpectations<GridLotsSelectorToggle>>()
			.owned('values', LotsSelectorToggle as unknown as Array<GridLotsSelectorToggle>)
			.byRef('disabled', () => undefined)
			.byRef('options', () => {
				return {
					label: (value) => {
						switch (value) {
							case 'taxLots':
								return this.$t('PORTFOLIO_TABLE.TAX_LOTS').toString();
							case 'positions':
							default:
								return this.$t('PORTFOLIO_TABLE.POSITIONS').toString();
						}
					},
					selected: (value) => value === this.selectedGridLotsType,
				};
			})
			.on('onClick', (ev) => this.onGridToSlotsTypeChange(ev))
			.create();
	}

	private setupUnclassified(data: WealthAssetTypeAnalyticsRO[] | undefined, classificationDTO: ClassificationDTO): void {
		if (this.selectedGroupBy !== null) {
			const currentDepth = getLevelDepth(this.selectedGroupBy);
			(data || []).forEach(d => {
				if ((d as WealthAssetAnalyticsRO | WealthInitialvsFinalAnalyticsRO).isUnclassified) {
					for (let i = 1; i < classificationDTO.length + 1; i++) {
						const classifications = (d as WealthAssetAnalyticsRO | WealthInitialvsFinalAnalyticsRO).classifications as Record<GroupByKey, string | null>;
						classifications[getLevelName(i)] = i === currentDepth ? Unclassified : null;
					}
				}
			});
		}
	}
}

type GridColumnStatePersist = { colId?: string; hide?: boolean | null; }