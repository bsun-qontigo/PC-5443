import { Component, Vue, Prop, Inject, ChildHandler, TwoWayExpectations, WrappedComponent, ParentHandler, createTwoWayBinding } from '@axioma/vue';
import VueTemplate from './template.vue';
import { AsyncLoader } from '@axioma/components';
import en from './assets/en';
import { plugins, utils } from '@axioma/common';
import { TextField } from '@axioma-framework/components';
import { ColumnApi, RowSelectedEvent, GridReadyEvent, CellEvent, ValueGetterFunc, ValueGetterParams, ColDef } from '@axioma-types/grid-wrapper';
import { GridHelpers } from '@axioma-framework/grid-wrapper';
import { createGrid } from './grid';
import { DateTime } from 'luxon';
import { Option, noop, Debouncer, notificationsService } from '@axioma/core';
import { ColumnVisibleEvent, ColumnState, ColumnMovedEvent } from '@ag-grid-community/core';
import { TabItem } from '@axioma-framework/layout';
import { DashboardHistogramChartField, WealthExtendedBatchOptimizationEntryOutputRO, WorksheetRequest, WorkspaceTabState } from '@axioma/wealth-types';
import { KeyMetricClick, HistogramChartClick, createNumberFormat, ExportHelpers } from '@axioma/wealth-commons';
import { DatepickerHandler, StandardNotificationHandler } from '@axioma-framework/qontum';
import { IWealthErrorsPanel, createErrorsPanel } from '@axioma-components/wealth-errors-panel';
import { WealthDriversPanel, WealthDriversPanelExpectations, createDriversPanel } from '@axioma-components/wealth-drivers-panel';
import { PillsComponentParams } from './grid/pills';
import { BatchTranslation, currentUser } from '@axioma/wealth-services';
import { FilterChangedEvent, Events } from '@ag-grid-community/all-modules';
import { BatchResultsGridApi, Context } from './grid/type';
import { wealthWorkspaceClientRegistry } from '@axioma-api/wealth-workspace';
import { BatchWorkspaceArchiveFileRequestRO } from '@axioma/wealth-models';
import * as fileSaver from 'file-saver';
import { wealthTaskClientRegistry } from '@axioma-api/wealth-task';
import { userApplicationStateClientRegistry } from '@axioma-api/wealth-user-application-state';
import { fsCloseDrivers, fsCloseErrors, fsFilterChanged, fsFilterRemoved, fsHighlight, fsHistogramClicked, fsKeyMetricClickHandler, fsShowDrivers, fsShowErrors } from './utils/fsEvents';
import { createHandleOptions } from './grid/column';
import { ColumnStateDTO, toColumnStateDTO } from './columnStateDTO';

plugins.lang.mergeLocaleMessage('en', en);

export type BatchResultsGridLayoutState = { columns: ColumnStateDTO[] }

export type BatchResultsHandler = TwoWayExpectations<{
	strategyName: string;
	date: Option<DateTime>;
	result: WealthExtendedBatchOptimizationEntryOutputRO[];
	loading: boolean;
	rootElm: HTMLElement;
	selected: string[];
}, {
	setSelected: (ptfs: string[]) => void;
	openDownloadPanel: () => void;
}, {
	openPortfolioTab: (rowData: WealthExtendedBatchOptimizationEntryOutputRO) => void;
	keyMetricClick: (e: KeyMetricClick) => void;
	histogramChartClick: (ev: HistogramChartClick) => void;
}>;

@Component({
	name: 'wealth-batch-results',
	packageName: '@axioma-components/wealth-batch-results',
	components: {
		AsyncLoader,
		TextField
	}
})
export default class BatchResults extends Vue.extend(VueTemplate) {
	@Inject()
	protected layoutTabItem!: TabItem;

	@Inject('openApp')
	protected openApp!: (id: string, name: string, state?: Record<string, unknown>) => void;

	@Prop({
		type: Object,
		required: true
	})
	protected handler!: ChildHandler<BatchResultsHandler>;

	protected gridApi!: BatchResultsGridApi;
	protected columnApi!: ColumnApi;
	protected isDownloadingTradeList = false;
	protected loading = false;
	protected plotId = `wid-${window.crypto.randomUUID()}`;
	protected selectedPfs = new Set<string>();
	protected columnStatesMap!: Record<string, ColumnState>;
	protected gridReadyEvent!: Promise<GridReadyEvent<WealthExtendedBatchOptimizationEntryOutputRO>>;
	protected handlerSelectedDate = null as unknown as DatepickerHandler;
	protected handlerPill = null as unknown as PillsComponentParams['handler'];
	protected errorPanelOpen = false;
	protected errorsPanel!: WrappedComponent<IWealthErrorsPanel<WealthExtendedBatchOptimizationEntryOutputRO>>;
	protected driversPanelOpen = false;
	protected driversPanel!: WrappedComponent<WealthDriversPanel>;
	protected driversPanelExpectations!: ParentHandler<WealthDriversPanelExpectations>;
	private appliedPill?: { field: DashboardHistogramChartField | 'newAccount' | 'cashFlow' | 'compliance', key: keyof typeof BatchTranslation, values?: number[]; formatter?: Intl.NumberFormat };
	private isHighlighting = false;

	protected get rowSelected(): boolean {
		return (this.handler.selected() ?? []).length > 0;
	}

	public static async createExportExcelRequest(date: DateTime, strat: string): Promise<WorksheetRequest> {
		const [results, userAppStates] = await Promise.all([wealthTaskClientRegistry.getResultsByStrategyNameAndDate(strat, date), userApplicationStateClientRegistry.getState<WorkspaceTabState>()]); // TODO catch
		const data: string[][] = [];
		const batchResultsGridColumns = GridHelpers.getColDefsByHandleOptions(createHandleOptions({} as Context, []), Promise.resolve(null as unknown as GridReadyEvent<WealthExtendedBatchOptimizationEntryOutputRO>));
		const home = userAppStates.items.find(i => i.applicationName === '@qwg') as WorkspaceTabState;
		const p = (home.content as object)['home-@axioma-apps/wealth' as keyof object] as Record<string, { batchResultsGrid: BatchResultsGridLayoutState }>;
		const columnStates = p?.[strat]?.batchResultsGrid?.columns;
		let isExportColumn: (col: ColDef<WealthExtendedBatchOptimizationEntryOutputRO>) => boolean;
		if (!columnStates) {
			isExportColumn = (col: ColDef<WealthExtendedBatchOptimizationEntryOutputRO>): boolean => !col.hide;
		} else {
			isExportColumn = (col: ColDef<WealthExtendedBatchOptimizationEntryOutputRO>): boolean => !columnStates.find(c => c.colId === col.colId)?.hide;
		}
		const filteredColumns = batchResultsGridColumns.filter(isExportColumn);
		for (const r of results) {
			data.push(filteredColumns.map(col => {
				const d = (col.valueGetter as ValueGetterFunc<WealthExtendedBatchOptimizationEntryOutputRO>)?.({ colDef: {}, node: { data: { ...r } } } as ValueGetterParams<WealthExtendedBatchOptimizationEntryOutputRO>);
				return d as string;
			}));
		}
		const customFormatting = ExportHelpers.getCustomFormatting<WealthExtendedBatchOptimizationEntryOutputRO>(filteredColumns);
		const headers = filteredColumns.map(col => col.headerName);
		return {
			key: strat,
			name: strat,
			sheetHeaders: ['Date', date.toJSDate(), 'Strategy', strat],
			data: {
				data: data as string[][],
				headers: headers as string[],
				...customFormatting
			}
		};
	}

	protected created(): void {
		this.handler.init(this, {
			histogramChartClick: this.histogramChartClickHandler,
			keyMetricClick: this.keyMetricClickHandler,
			openPortfolioTab: this.openPortfolioTab
		});
		this.handlerPill = {
			label: '',
			closeable: true,
			onClose: () => {
				this.removefilter();
			},
			size: 'lg',
			show: false

		};
		this.handlerSelectedDate = {
			value: this.handler.date(),
			clearable: false,
			disabled: true,
			onChange: value => {
				this.handlerSelectedDate.value = value;
			}
		};
	}

	protected removefilter(): void {
		fsFilterRemoved();
		this.handlerPill.show = false;
		this.gridApi?.setFilterModel(null);
	}

	protected changedFilter(ev: FilterChangedEvent): void {
		fsFilterChanged();
		const filters = ev.api.getFilterModel();
		if (this.handlerPill.show && this.appliedPill && Object.keys(filters).includes(this.appliedPill.field) && Object.keys(filters).length === 1) {
			this.showFilterPill(filters);
			this.handlerPill.show = true;
		} else {
			this.handlerPill.show = false;
		}
		if (!this.isHighlighting) {
			this.removeAllSelected();
		}
		this.isHighlighting = false;
	}

	protected showFilterPill(filters: Record<string, { filter: number; filterTo?: number }>): void {
		if (this.appliedPill?.values) {
			const fmt = this.appliedPill.formatter;
			const { filter, filterTo } = filters[this.appliedPill.key];
			if (fmt) {
				this.handlerPill.label = `${this.$t(BatchTranslation[this.appliedPill.key]).toString()} ${fmt.format(filter)} ${filterTo ? ' to ' + fmt.format(filterTo) : ''}`;
			} else {
				this.handlerPill.label = `${this.$t(BatchTranslation[this.appliedPill.key]).toString()} ${filter} ${filterTo ? ' to ' + filterTo : ''}`;
			}
		}
	}

	protected mounted(): void {
		const rowSelected = (e: RowSelectedEvent<WealthExtendedBatchOptimizationEntryOutputRO>) => {
			const selectedRows = e.api.getSelectedRows().map(i => i.accountName as string);
			this.handler.setSelected(selectedRows || []);
		};

		this.$watch(() => this.handler.selected().slice().sort().join(','), () => {
			this.selectRows();
		}, { immediate: true });

		const _columnChanged = this.updateGridState.bind(this);
		const debouncerTime = 0;
		const debouncerForColumn = new Debouncer(debouncerTime, _columnChanged);
		const columnVisibleChanged = (e: ColumnVisibleEvent) => {
			e.columnApi.autoSizeAllColumns();
			debouncerForColumn.tick();
		};
		const columnMoved = (_e: ColumnMovedEvent) => {
			debouncerForColumn.tick();
		};
		const key: string = this.handler.strategyName();
		const state = (this.layoutTabItem.getState<unknown, { batchResultsGrid: BatchResultsGridLayoutState }>(key) || {}) as { batchResultsGrid: BatchResultsGridLayoutState };
		const batchResultsGridState: BatchResultsGridLayoutState = state.batchResultsGrid || {} as BatchResultsGridLayoutState;
		const savedColumns = batchResultsGridState.columns;
		const ctx = this.getContext();
		const columns = createHandleOptions(ctx, savedColumns);
		this.gridReadyEvent = createGrid(this, columns, {
			context: ctx,
			elm: this.$refs.table as HTMLElement,
		});
		this.gridReadyEvent.then(e => {
			this.gridApi = e.api as BatchResultsGridApi;
			this.gridApi.showLoadingOverlay();
			this.columnApi = e.columnApi;
			(this.$refs.table as HTMLElement).classList.add(this.plotId);
			this.gridApi.addEventListener(Events.EVENT_ROW_SELECTED, rowSelected);
			this.gridApi.addEventListener(Events.EVENT_COLUMN_VISIBLE, columnVisibleChanged);
			this.gridApi.addEventListener(Events.EVENT_COLUMN_MOVED, columnMoved);
			this.gridApi.addEventListener(Events.EVENT_FILTER_CHANGED, this.changedFilter);
			this.$watch(this.handler.result, this.updateRowData);
		});
		this.onDestroy(() => {
			this.gridApi.removeEventListener(Events.EVENT_ROW_SELECTED, rowSelected);
			this.gridApi.removeEventListener(Events.EVENT_COLUMN_VISIBLE, columnVisibleChanged);
			this.gridApi.removeEventListener(Events.EVENT_COLUMN_MOVED, columnMoved);
			this.gridApi.removeEventListener(Events.EVENT_FILTER_CHANGED, this.changedFilter);
		});
	}
	protected getContext(): Context {
		return {
			loading: this.loading,
			columnStatesMap: this.columnStatesMap,
			handlerPill: this.handlerPill,
			handlerSelectedDate: this.handlerSelectedDate,
			isDownloadingTradeList: this.isDownloadingTradeList,
			columnApi: () => this.columnApi,
			gridApi: () => this.gridApi,
			rowSelected: () => this.rowSelected,
			date: () => this.handler.date(),
			strategyName: () => this.handler.strategyName(),
			openDownloadPanel: () => this.handler.openDownloadPanel(),
			element: () => this.handler.rootElm(),
			driverSidebar: this.driverSidebar,
			showErrors: this.showErrors,
			closeErrorsPanel: this.closeErrorsPanel,
			openPortfolioTab: this.openPortfolioTab,
			workspaceDownload: this.workspaceDownload
		};
	}

	protected showErrors(data: WealthExtendedBatchOptimizationEntryOutputRO): void {
		fsShowErrors();
		const createNotificationHandlers = (() => {
			return (data.log?.errors ?? []).map(error => {
				return {
					select: noop,
					timestamp: '' as unknown as DateTime,
					severity: 'error',
					body: error,
					icon: 'fa-regular fa-database',
					title: this.$t('ERROR').toString(),
				};
			});
		}) as () => StandardNotificationHandler[];
		if (this.$parent) {
			const batchName = data.accountName ?? '';
			if (!this.errorPanelOpen) {
				this.errorPanelOpen = true;
				const elm = this.$refs.sidePanelContainer as HTMLElement;
				elm.classList.remove('position-relative');
				this.errorsPanel = createErrorsPanel<WealthExtendedBatchOptimizationEntryOutputRO>({ elm, data, createNotificationHandlers, parent: this.$parent, headerName: batchName });
			} else {
				this.errorsPanel.updateWith({
					data,
					createNotificationHandlers,
					headerName: batchName,
				});
			}
			this.errorsPanel.on('close', this.closeErrorsPanel);
		}
	}

	protected driverSidebar(data: CellEvent<WealthExtendedBatchOptimizationEntryOutputRO>): void {
		fsShowDrivers();
		const rowData = data.data;
		if (rowData.analytics?.subscores) {
			if (this.$parent) {
				const batchName = data.data.accountName ?? '';
				if (!this.driversPanelOpen) {
					this.driversPanelOpen = true;
					const elm = this.$refs.sidePanelContainer as HTMLElement;
					elm.classList.remove('position-relative');
					const res = createDriversPanel({ elm, data: rowData, parent: this.$parent, headerName: batchName, loading: false, onClose: this.closeDriversPanel.bind(this) });
					this.driversPanel = res.component;
					this.driversPanelExpectations = res.handler;
				} else {
					const handler: ParentHandler<WealthDriversPanelExpectations> = createTwoWayBinding<WealthDriversPanelExpectations>()
						.byRef('data', () => rowData)
						.byRef('analysisDate', () => undefined)
						.byRef('headerName', () => batchName)
						.byRef('loading', () => false)
						.on('onClose', this.closeDriversPanel)
						.create();
					this.driversPanelExpectations.child.then(c => c.updateWith(handler));
				}
			}
		}
	}
	protected closeDriversPanel(): void {
		fsCloseDrivers();
		this.driversPanel?.destroy();
		this.driversPanelOpen = false;
	}

	protected closeErrorsPanel(): void {
		fsCloseErrors();
		this.errorsPanel?.destroy();
		this.errorPanelOpen = false;
	}

	protected workspaceDownload(): void {
		const rows = this.gridApi.getSelectedRows();
		if (rows.length === 1) {
			this.loading = true;
			const { workspaceId, strategyName, accountName } = rows[0];
			const date = this.handler.date();
			if (workspaceId && date.some) {
				wealthWorkspaceClientRegistry.getWorkspaceBy({
					date: date.value as DateTime,
					strategy: strategyName as string,
					portfolio: accountName as string,
					workspaceId: workspaceId
				})
					.then(data => {
						this.loading = false;
						const blob = new Blob([data], { type: 'xml' });
						fileSaver.saveAs(blob, `${workspaceId}.xml`);
						notificationsService.notificationsServiceRegistry.successToast({ title: this.$t('BATCH_RESULTS.DOWNLOAD_WORKSPACE') });
					})
					.catch(e => notificationsService.notificationsServiceRegistry.notifyHttpErrors(e));
			}
		} else {
			const date = this.handler.date();
			if (date.some) {
				const request: BatchWorkspaceArchiveFileRequestRO = {
					date: utils.dateUtils.dateFormatShort(date.value),
					strategy: this.handler.strategyName(),
					workspaces: rows.map(i => {
						return {
							portfolioName: i.accountName,
							workspaceId: i.workspaceId
						};
					})
				};
				wealthWorkspaceClientRegistry.archives(request)
					.then((_res) => {
						this.handler.openDownloadPanel();
						notificationsService.notificationsServiceRegistry.successToast({ title: this.$t('BATCH_RESULTS.DOWNLOAD_WORKSPACES') });
					}
					)
					.catch(e => notificationsService.notificationsServiceRegistry.notifyHttpErrors(e));
			}
		}
	}

	protected openPortfolioTab(rowData: WealthExtendedBatchOptimizationEntryOutputRO): void {
		const portfolioName = rowData.accountName as string;
		this.openApp('@axioma-apps/portfolio-tab', portfolioName, { portfolioName, strategyName: this.handler.strategyName(), asOf: rowData.date, module: '@axioma-apps/portfolio-tab' });
	}

	private removeAllSelected(): void {
		this.gridApi?.deselectAll();
	}

	private keyMetricClickHandler(e: KeyMetricClick) {
		fsKeyMetricClickHandler(e.key);
		const d = e;
		this.removefilter();
		this.appliedPill = { key: d.key, field: d.field };
		switch (d.key) {
			case 'newAccounts':
				this.handlerPill.label = this.$t(BatchTranslation[d.key]).toString();
				this.handlerPill.show = true;
				this.gridApi.setFilterModel({
					[d.field]: {
						filterType: 'set', values: ['New']
					}
				});
				this.columnApi.setColumnVisible('newAccount', true);
				break;
			case 'cashRaise':
			case 'cashDeficit':
				this.handlerPill.label = this.$t(BatchTranslation[d.key]).toString();
				this.handlerPill.show = true;
				this.columnApi.setColumnVisible('cashFlow', true);
				this.gridApi.setFilterModel({
					[d.field]: {
						filterType: 'number',
						type: d.key === 'cashDeficit' ? 'lessThan' : 'greaterThan',
						filter: '0'
					}
				});
				break;
			case 'compliance':
				this.handlerPill.label = this.$t(BatchTranslation[d.key]).toString();
				this.handlerPill.show = true;
				this.gridApi.setFilterModel({
					[d.field]: {
						filterType: 'set', values: ['true']
					}
				});
				break;
			default:
				this.removefilter();
		}
	}
	private histogramChartClickHandler(e: HistogramChartClick) {
		fsHistogramClicked(e.field);
		this.removefilter();
		const culture = currentUser.settings.numberFormatValue?.culture as string;
		let fmt: Intl.NumberFormat;
		if (e.field === 'realizedGainsYTD') {
			fmt = createNumberFormat(culture, +currentUser.settings.decimalDigits, 'compact');
		} else {
			fmt = createNumberFormat(culture, +currentUser.settings.decimalDigits);
		}
		this.appliedPill = { field: e.field, key: e.field, values: [e.range[0], e.range[1]], formatter: fmt };
		this.handlerPill.label = `${this.$t(BatchTranslation[e.field]).toString()} ${e.range[0]} - ${e.range[1]}`;
		this.handlerPill.show = true;
		this.gridApi.setFilterModel({
			[e.field]: {
				filterType: 'number',
				type: 'inRange',
				filter: e.range[0],
				filterTo: e.range[1]
			}
		});
	}

	private updateRowData(): void {
		const data = this.handler.result();
		this.gridReadyEvent.then(() => {
			setTimeout(() => {
				this.fillGrid(data);
				this.columnApi.autoSizeAllColumns();
			});
		});
	}

	private selectRows(): void {
		fsHighlight();
		const ids = this.handler.selected();
		this.isHighlighting = true;
		this.removefilter();
		this.gridApi?.deselectAll();
		const lastSelectedAccountName = ids[ids.length - 1];
		this.gridApi?.forEachNode(node => {
			if (node.data.accountName) {
				if (lastSelectedAccountName === node.data.accountName) {
					this.gridApi.ensureNodeVisible(node, 'middle');
				}
				node.setSelected(ids.includes(node.data.accountName));
			}
			// force checkbox column to refresh;
			node.setData(node.data);
		});
	}

	private fillGrid(data: WealthExtendedBatchOptimizationEntryOutputRO[]): void {
		if (data.length > 0) {
			this.gridApi.hideOverlay();
			this.gridApi.setRowData(data);
		} else {
			this.gridApi.showNoRowsOverlay();
			this.gridApi.setRowData([]);
		}
	}

	private updateGridState(): void {
		const key: string = this.handler.strategyName();
		this.layoutTabItem.setState<unknown, { batchResultsGrid: BatchResultsGridLayoutState }>(key, {
			... this.layoutTabItem.getState<unknown, { batchResultsGrid: BatchResultsGridLayoutState }>(key), ...{
				batchResultsGrid: {
					columns: this.columnApi.getAllGridColumns().map<ColumnStateDTO>(toColumnStateDTO)
				}
			}
		});
	}
}