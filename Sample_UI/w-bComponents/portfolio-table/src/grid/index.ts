import { Context } from './type';
import { compile, VueClass, createOneWayBinding } from '@axioma/vue';
import { MenuItemDef } from '@ag-grid-community/all-modules';
import type { HandleOptions, GridReadyEvent, CreateGridOptions } from '@axioma-types/grid-wrapper';
import { Grid, StatusBar } from '@axioma-framework/grid-wrapper';
import { plugins } from '@axioma/common';
import { getContextMenuItems } from './contextMenu';
import DownloadMenu from './downloadMenu';
import { CsvDownloader } from './downloaders/csv';
import { WealthAssetAnalyticsRO } from '@axioma/wealth-types';
import { ExcelDownloader } from './downloaders/excel';
import { gridColumns } from './column';
import GroupBySelector, { GroupBySelectorExpectations } from '../groupby-selector';

export function createGrid(parent: VueClass, { context, elm }: CreateGridOptions<Context>): Promise<GridReadyEvent<WealthAssetAnalyticsRO>> {
	let i = 0;
	return Grid
		.create<WealthAssetAnalyticsRO>({
			elm,
			handlers: [
				...gridColumns(),
				...actionBar(context)
			],
			options: {
				context: parent,
				defaultColDef: {
					editable: false,
					menuTabs: ['filterMenuTab', 'generalMenuTab', 'columnsMenuTab']
				},
				rowSelection: 'multiple',
				enableBrowserTooltips: true,
				getRowNodeId: row => row.assetId as string + i++,
				suppressAggFuncInHeader: true,
				getContextMenuItems(): (string | MenuItemDef)[] {
					return getContextMenuItems(context);
				}
			}
		});
}

const actionBar = (context: Context): HandleOptions<WealthAssetAnalyticsRO>[] => ([
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
	StatusBar.createToggleButton({
		key: 'gridPicker',
		align: 'left',
		handler: context.toggleButton
	}),
	StatusBar.createToggleButton({
		key: 'gridPicker',
		align: 'left',
		handler: context.toggleButtonSlots
	}),
	StatusBar.createDiv({
		key: 'groupBySelector',
		align: 'right',
		element(): HTMLElement {
			const handler = createOneWayBinding<GroupBySelectorExpectations>()
				.byRef('context', () => context)
				.on('changeGroupBy', context.changeGroupBy)
				.create();
			const instance = compile({
				module: '',
				component: GroupBySelector,
				propsData: {
					handler,
					cssClass: 'marg-right-s'
				}
			});
			instance.mount();
			return instance.$el;
		},
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
		disabled: context.loading,
		show: true,
		getItems: params => {
			return {
				generate: menu => {
					const comp = compile({
						module: '',
						component: DownloadMenu,
						parent: params.context
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
						new ExcelDownloader(context, true).download()
							.catch(/*TODO*/)
							.finally(afterDownload);
					});
					comp.on('onMultipleDownloadExcel', () => {
						new ExcelDownloader(context, false).download()
							.catch(/*TODO*/)
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
					return comp.$elm;
				}
			};
		},
		QFLabel: 'download-menu',
		align: 'right'
	})),
]);