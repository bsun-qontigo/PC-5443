import { MenuItemDef, ExcelStyle } from '@ag-grid-community/all-modules';
import { Grid, StatusBar } from '@axioma-framework/grid-wrapper';
import type { HandleOptions, GridReadyEvent, CreateGridOptions, RowClickedEvent, RowDoubleClickedEvent, GetContextMenuItemsParams } from '@axioma-types/grid-wrapper';
import { plugins, utils } from '@axioma/common';
import { Context } from './type';
import { CsvDownloader } from './downloaders/csv';
import { WealthExtendedBatchOptimizationEntryOutputRO } from '@axioma/wealth-types';
import { compile, VueClass } from '@axioma/vue';
import DownloadMenu from './downloadMenu';
import { getContextMenuItems } from './contextMenu';
import { createPills } from './pills';
import { TradeListDownloader } from './downloaders/tradeList';
import { ExcelDownloader } from './downloaders/excel';
import { fsOpenDrillDown } from '../utils/fsEvents';

type HealthScoreStyleKey = 'healthScoreSuccess' | 'healthScoreWarning' | 'healthScoreInfo' | 'healthScoreError';

export const allowOpenPortfolioDrilldown = ({ workspaceId }: WealthExtendedBatchOptimizationEntryOutputRO): boolean => !!workspaceId;

export function createGrid(parent: VueClass, columns: HandleOptions<WealthExtendedBatchOptimizationEntryOutputRO>[], { context, elm }: CreateGridOptions<Context>): Promise<GridReadyEvent<WealthExtendedBatchOptimizationEntryOutputRO>> {
	return Grid
		.create<WealthExtendedBatchOptimizationEntryOutputRO>({
			elm,
			handlers: [
				...columns,
				...actionBar(context)
			],
			options: {
				context: parent,
				defaultColDef: {
					editable: false,
					menuTabs: ['filterMenuTab', 'generalMenuTab', 'columnsMenuTab'],
					minWidth: 100
				},
				enableRangeSelection: false,
				rowSelection: 'multiple',
				suppressRowClickSelection: true,
				getRowNodeId: row => row.workspaceId as string,
				isRowSelectable: row => !!row.data.workspaceId,
				rowClassRules: {
					'has-error': e => e.node.data.log?.errors && e.node.data.log?.errors.length > 0 || false
				},
				onRowClicked: ((params: RowClickedEvent<WealthExtendedBatchOptimizationEntryOutputRO>) => {
					if (params.data.log?.errors && params.data.log.errors.length > 0) {
						context.showErrors(params.data);
					} else {
						context.closeErrorsPanel();
					}
				}),
				onRowDoubleClicked(params: RowDoubleClickedEvent<WealthExtendedBatchOptimizationEntryOutputRO>) {
					if (allowOpenPortfolioDrilldown(params.data)) {
						fsOpenDrillDown();
						context.openPortfolioTab(params.data);
					}

				},
				getContextMenuItems(params: GetContextMenuItemsParams<WealthExtendedBatchOptimizationEntryOutputRO>): (string | MenuItemDef)[] {
					return getContextMenuItems(params, context);
				},
				excelStyles: [
					{
						id: 'healthScoreError',
						interior: {
							patternColor: '',
							color: '#f9b5b3',
							pattern: 'Solid',

						},
						font: {
							color: '#8c110d',
						}
					},
				] as Array<Omit<ExcelStyle, 'id'> & { id: HealthScoreStyleKey }>
			}
		});
}

const actionBar = (context: Context): HandleOptions<WealthExtendedBatchOptimizationEntryOutputRO>[] => ([
	StatusBar.createCount({
		key: 'count',
		align: 'left',
		totalCount: params => {
			let total = 0;
			params.api.forEachLeafNode(() => {
				total++;
			});
			return total;
		}
	}),
	StatusBar.createClearFilter({
		key: 'clearFilter',
		align: 'left'
	}),
	StatusBar.createQuickFilter({
		key: 'filter',
		align: 'left'
	}),
	StatusBar.createExtraText({
		key: 'dateLabel',
		align: 'left',
		text: () => {
			const date = context.date();
			if (date.some) {
				return utils.dateUtils.dateFormatMedium(utils.dateUtils.getDateTimeFromAPI(date.value));
			}
			return '';
		}
	}),
	createPills({
		key: 'filterPill',
		align: 'left',
		handler: context.handlerPill
	}),
	StatusBar.createLastRefresh({
		key: 'lastRefresh',
		align: 'right'
	}),
	StatusBar.createMenu(({
		key: 'download',
		title: plugins.lang.t('DOWNLOAD').toString(),
		icon: 'fa-arrow-down-to-line',
		closeOnIconClick: true,
		shadow: true,
		disabled: () => context.loading,
		show: true,
		getItems: params => {
			return {
				generate: menu => {
					const comp = compile({
						module: '',
						component: DownloadMenu,
						parent: params.context,
						propsData: {
							context
						}
					});
					comp.mount();
					const div = comp.$elm;
					const afterDownload = () => {
						menu.menuResolve();
						comp.destroy();
					};
					requestAnimationFrame(() => {
						menu.menuListen('click', ev => {
							if (div.contains(ev.target as HTMLElement)) {
								return;
							}
							afterDownload();
						});
					});

					comp.on('onDownloadExcel', () => {
						new ExcelDownloader(context).download().catch(/*TODO*/)
							.finally(afterDownload);
					});
					comp.on('onDownloadCsv', () => {
						new CsvDownloader(context).download();
						afterDownload();
					});
					comp.on('onDownloadWorkspace', () => {
						context.workspaceDownload();
						afterDownload();
					});
					comp.on('onDownloadTradeList', () => {
						context.isDownloadingTradeList = true;
						new TradeListDownloader(context).download()
							.catch(/**TODO */)
							.finally(() => {
								document.body.style.cursor = '';
								context.loading = false;
								context.isDownloadingTradeList = false;
								afterDownload();
							});
					});
					return comp.$elm;
				}
			};
		},
		QFLabel: 'download-menu',
		align: 'right'
	})),
]);
