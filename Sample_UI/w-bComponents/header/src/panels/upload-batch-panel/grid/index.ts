import { MenuItemDef } from '@ag-grid-community/all-modules';
import { Grid, DateColumn, TextColumn, StatusBar, SinglePillColumn } from '@axioma-framework/grid-wrapper';
import type { HandleOptions, GridReadyEvent, CreateGridOptions, GetContextMenuItemsParams } from '@axioma-types/grid-wrapper';
import { plugins } from '@axioma/common';
import { Context, RowData } from './type';
import { VueClass } from '@axioma/vue';
import * as FilenameColumn from './filenameColumn';

export function createGrid(parent: VueClass, { context, elm }: CreateGridOptions<Context>): Promise<GridReadyEvent<RowData>> {
	return Grid
		.create<RowData>({
			elm,
			handlers: [
				...gridColumns(context),
				...actionBar(context)
			],
			options: {
				context: parent,
				defaultColDef: {
					editable: false,
					menuTabs: ['filterMenuTab', 'generalMenuTab', 'columnsMenuTab']
				},
				enableRangeSelection: false,
				rowSelection: 'multiple',
				suppressRowClickSelection: true,
				enableBrowserTooltips: true,
				getRowNodeId: row => row.filename + row.ii as string,
				isRowSelectable: row => !!row.data.filename,
				getContextMenuItems(_params: GetContextMenuItemsParams<RowData>): (string | MenuItemDef)[] {
					return [];
				},
			}
		});
}

export const gridColumns = (context: Context): HandleOptions<RowData>[] => ([
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	FilenameColumn.create({
		colId: 'filename',
		field: 'filename',
		headerName: plugins.lang.t('BATCH_IMPORT.FILE'),
		flex: 1,
		filenameCellRenderParams: {
			onClicked: (params) => {
				context.openProcessingStatus(params);
			}
		}
	}),
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	DateColumn.create({
		colId: 'dropDateTime',
		field: 'dropDateTime',
		flex: 1,
		dateCellRenderParams: DateColumn.dateTimeRenderParams,
		headerName: plugins.lang.t('DATE'),
	}),
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	TextColumn.create({
		colId: 'size',
		field: 'size',
		flex: 1,
		headerName: plugins.lang.t('BATCH_IMPORT.SIZE'),
	}),
	SinglePillColumn.create({
		field: {
			getter(node) {
				return node.data.status;
			}
		},
		colId: 'status',
		headerName: plugins.lang.t('BATCH_IMPORT.STATUS'),
		editable: false,
		flex: 0,
		cellRendererParams: {
			type: (params) => {
				switch (params.status) {
					case 'Uploaded':
						return 'eucalyptus';
					case 'Wrong Extension':
						return 'error-pill';
					default:
						return 'danube';
				}
			}
		},
		tooltipValueGetter: (params) => {
			if (params.value === 'Wrong Extension') {
				return plugins.lang.t('BATCH_IMPORT.ONLY_ZIP');
			}
			return params.value;
		}
	}),
]);

const actionBar = (_context: Context): HandleOptions<RowData>[] => ([
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
]);
