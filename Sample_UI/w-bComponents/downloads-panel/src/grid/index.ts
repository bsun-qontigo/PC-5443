import { Context } from './type';
import { VueClass } from '@axioma/vue';
import { MenuItemDef } from '@ag-grid-community/all-modules';
import type { HandleOptions, GridReadyEvent, CreateGridOptions } from '@axioma-types/grid-wrapper';
import { Grid, TextColumn, NumberBarColumn, DateColumn, IconColumn } from '@axioma-framework/grid-wrapper';
import { getContextMenuItems } from './contextMenu';
import { plugins } from '@axioma/common';
import { WealthBatchWorkspaceArchiveFileTaskStatusRO } from '@axioma/wealth-types';
export function createGrid(parent: VueClass, { context, elm }: CreateGridOptions<Context>): Promise<GridReadyEvent<WealthBatchWorkspaceArchiveFileTaskStatusRO>> {
	return Grid
		.create<WealthBatchWorkspaceArchiveFileTaskStatusRO>({
			elm,
			handlers: [
				...gridColumns(context),
				...actionBar()
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
				getContextMenuItems(): (string | MenuItemDef)[] {
					return getContextMenuItems();
				}
			}
		});
}
const simplePercetFormatter = new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 0, maximumFractionDigits: 0 });
export const gridColumns = (context: Context): HandleOptions<WealthBatchWorkspaceArchiveFileTaskStatusRO>[] => ([
	TextColumn.create({
		colId: 'workspace',
		field: {
			getter: node => `${node.data.strategyName}-${node.data.requestId?.split('-')[0]}`
		},
		headerName: plugins.lang.t('DOWNLOAD_PANEL.WORKSPACE').toString(),
		editable: false,
		flex: 1,
	}),
	NumberBarColumn.create({
		colId: 'filesProcessed',
		field: {
			getter: node => {
				if (node.data.cancelled) {
					return -1;
				}
				if (node.data?.filesProcessed && node.data?.totalFilesToBeInZip) {
					return (node.data.filesProcessed / node.data.totalFilesToBeInZip);
				}
				return 0;
			}
		},
		headerName: plugins.lang.t('DOWNLOAD_PANEL.STATUS').toString(),
		numberBarCellRenderParams: {
			formatter: value => {
				switch (value) {
					case 1:
						return plugins.lang.t('DOWNLOAD_PANEL.COMPLETED').toString();
					case -1:
						return plugins.lang.t('DOWNLOAD_PANEL.CANCELLED').toString();
					default:
						return `${simplePercetFormatter.format(value)} ${plugins.lang.t('DOWNLOAD_PANEL.PREPARING_ELLIPSIS').toString()}`;
				}
			},
			positiveColor: () => 'bar-cell-progress' as 'info'
		},
		sortable: true,
		cellClassRules: {
			'left-aligned': params => {
				const value = params.value as number;
				switch (value) {
					case 1:
						return false;
					case -1:
						return false;
					default:
						return true;
				}
			}
		}
	}),
	IconColumn.create({
		field: {
			getter: node => {
				if (node.data?.filesProcessed && node.data?.totalFilesToBeInZip && !node.data?.cancelled) {
					if ((node.data.filesProcessed / node.data.totalFilesToBeInZip) * 100 !== 100) {
						return 'fa-circle-xmark';
					}
				}
				return '';
			}
		},
		headerName: '',
		editable: false,
		cellRendererParams: {
			title: plugins.lang.t('DOWNLOAD_PANEL.CANCEL').toString()
		},
		width: 30,
		onCellClicked: context.cancel
	}),
	DateColumn.create({
		colId: 'startTime',
		field: 'startTime',
		headerName: plugins.lang.t('DOWNLOAD_PANEL.TIMESTAMP').toString(),
		dateCellRenderParams: DateColumn.dateTimeRenderParams,
		editable: false,
		sort: 'desc',
		flex: 1
	}),
	IconColumn.create({
		field: {
			getter: node => {
				if (node.data?.filesProcessed && node.data?.totalFilesToBeInZip) {
					if ((node.data.filesProcessed / node.data.totalFilesToBeInZip) * 100 === 100) {
						return 'fa-arrow-down-to-bracket';
					}
				}
				return '';
			}
		},
		headerName: plugins.lang.t('DOWNLOAD_PANEL.DOWNLOAD').toString(),
		editable: false,
		cellRendererParams: {
			title: plugins.lang.t('DOWNLOAD_PANEL.DOWNLOAD').toString()
		},
		width: 90,
		onCellClicked: context.download
	})
]);

const actionBar = (): HandleOptions<WealthBatchWorkspaceArchiveFileTaskStatusRO>[] => ([

]);