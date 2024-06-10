import { Grid, DateColumn, TextColumn, NumberColumn, StatusBar } from '@axioma-framework/grid-wrapper';
import { HandleOptions, GridReadyEvent, CreateGridOptions, RowClickedEvent, GetContextMenuItemsParams } from '@axioma-types/grid-wrapper';
import { plugins } from '@axioma/common';
import { Context } from '../../type';
import { ProcessingStatusTranslation } from '@axioma/wealth-services';
import { WealthBatchJobRO } from '@axioma/wealth-types';
import { userApplicationStateClientRegistry } from '@axioma-api/wealth-user-application-state';
import { MenuItemDef } from '@ag-grid-community/all-modules';
import { getContextMenuItems } from './contextMenu';
import { VueClass } from '@axioma/vue';

export function createGrid(parent: VueClass,{ context, elm }: CreateGridOptions<Context>): Promise<GridReadyEvent<WealthBatchJobRO>> {
	return Grid
		.create<WealthBatchJobRO>({
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
				enableRangeSelection: false,
				rowSelection: 'single',
				suppressRowClickSelection: false,
				getRowNodeId: row => row.batchId as string,
				onRowClicked: ((params: RowClickedEvent<WealthBatchJobRO>) => {
					if ((params.data.log?.errors?.length ?? 0) > 0 || (params.data.numErrors ?? 0) > 0) {
						context.showErrors(params.data);
					} else {
						context.closeErrorsPanel();
					}
				}),
				getContextMenuItems(params: GetContextMenuItemsParams<WealthBatchJobRO>): (string | MenuItemDef)[] {
					return getContextMenuItems(params);
				},
			}
		});
}

const gridColumns = (): HandleOptions<WealthBatchJobRO>[] => ([
	TextColumn.create({
		colId: 'strategyName',
		field: 'strategyName',
		headerName: plugins.lang.t(ProcessingStatusTranslation.strategyName).toString(),
		editable: false,
		hide: false,
		flex: 1
	}),
	TextColumn.create({
		colId: 'batchId',
		field: 'batchId',
		headerName:  plugins.lang.t(ProcessingStatusTranslation.batchId).toString(),
		editable: false,
		hide: false,
		flex: 1
	}),
	TextColumn.create({
		colId: 'username',
		field: 'username',
		headerName:  plugins.lang.t(ProcessingStatusTranslation.username).toString(),
		editable: false,
		hide: false,
		flex: 1
	}),
	DateColumn.create({
		colId: 'createdAt',
		field: 'createdAt',
		headerName:  plugins.lang.t(ProcessingStatusTranslation.submission).toString(),
		dateCellRenderParams: DateColumn.dateTimeRenderParams,
		editable: () => false,
		sortable: true,
		hide: false,
		flex: 1
	}),
	TextColumn.create({
		colId: 'status',
		field: {
			getter(node) {
				return  plugins.lang.t(['PROCESSING_STATUS', node.data.status as string].join('.')).toString();
			}
		},
		headerName:  plugins.lang.t(ProcessingStatusTranslation.status).toString(),
		editable: false,
		hide: false,
		flex: 1
	}),
	NumberColumn.create({
		colId: 'numAccounts',
		field: 'numAccounts',
		headerName:  plugins.lang.t(ProcessingStatusTranslation.portfolios).toString(),
		formatter: userApplicationStateClientRegistry.getFormatter('integer'),
		editable: false,
		sortable: true,
		hide: false,
		flex: 1
	}),
	NumberColumn.create({
		colId: 'numErrors',
		field: 'numErrors',
		headerName:  plugins.lang.t(ProcessingStatusTranslation.errors).toString(),
		formatter: userApplicationStateClientRegistry.getFormatter('integer'),
		editable: false,
		sortable: true,
		hide: false,
		flex: 1
	}),
	NumberColumn.create({
		colId: 'numOptimizationWithSolution',
		field: 'numOptimizationsWithSolution',
		headerName:  plugins.lang.t(ProcessingStatusTranslation.solutions).toString(),
		formatter: userApplicationStateClientRegistry.getFormatter('integer'),
		editable: false,
		sortable: true,
		hide: false,
		flex: 1
	}),
	NumberColumn.create({
		colId: 'numOptimizationsWithNoSolution',
		field: 'numOptimizationsWithNoSolution',
		headerName:  plugins.lang.t(ProcessingStatusTranslation.noSolution).toString(),
		formatter: userApplicationStateClientRegistry.getFormatter('integer'),
		editable: false,
		sortable: true,
		hide: false,
		flex: 1
	}),

]);

const actionBar = (context: Context): HandleOptions<WealthBatchJobRO>[] => ([
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
	StatusBar.createLastRefresh({
		key: 'lastRefresh',
		align: 'right'
	}),
	StatusBar.createIconButton({
		key: 'refresh',
		icon: 'fa-sync',
		title: plugins.lang.t('REFRESH').toString(),
		action: context.onRefresh,
		disabled: () => context.loading,
		QFLabel: 'refresh'
	}),
	StatusBar.createIconButton({
		key: 'export',
		icon: 'fa-arrow-down-to-line',
		title: plugins.lang.t('DOWNLOAD').toString(),
		action: () => {
			context.gridApi().exportDataAsCsv({
				fileName: `processing_status_${new Date().toUTCString()}.csv`
			});
		},
		disabled: () => false,
		QFLabel: 'download'
	})
]);