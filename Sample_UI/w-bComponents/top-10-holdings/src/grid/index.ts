import { Grid, TextColumn, NumberBarColumn } from '@axioma-framework/grid-wrapper';
import type { HandleOptions, GridReadyEvent, CreateGridOptions } from '@axioma-types/grid-wrapper';
import { plugins } from '@axioma/common';
import { userApplicationStateClientRegistry } from '@axioma-api/wealth-user-application-state';
import { Context, Top10Holdings } from '../type';
import { VueClass } from '@axioma/vue';
import { getContextMenuItems } from './contextMenu';

export function createGrid(parent: VueClass, { context, elm }: CreateGridOptions<Context>): Promise<GridReadyEvent<Top10Holdings>> {
	return Grid
		.create<Top10Holdings>({
			elm,
			handlers: [
				...gridColumns(context),
				...[]
			],
			options: {
				context: parent,
				defaultColDef: {
					editable: false,
					menuTabs: ['filterMenuTab', 'generalMenuTab', 'columnsMenuTab'],
				},
				rowSelection: 'multiple',
				enableBrowserTooltips: true,
				getRowNodeId: row => row.assetId,
				getContextMenuItems: params => getContextMenuItems(params, context),
			}
		});
}

export const gridColumns = (context: Context): HandleOptions<Top10Holdings>[] => ([
	TextColumn.create({
		colId: 'assetId',
		field: 'assetId',
		headerName: plugins.lang.t('ASSET_ID').toString(),
		editable: false,
		flex: 1,
		lockPosition: true,
		hide: true
	}),
	TextColumn.create({
		colId: 'description',
		field: 'description',
		headerName: plugins.lang.t('POSITION').toString(),
		editable: false,
		flex: 1,
		lockPosition: true,
		tooltipValueGetter(params) {
			if (context.dupAssets().get(params.value)) {
				return `${params.value} (${params.data?.assetId})`;
			} else {
				return params.value;
			}
		}
	}),
	NumberBarColumn.create({
		colId: 'allocation',
		field: 'allocation',
		headerName: plugins.lang.t('ALLOCATION').toString(),
		numberBarCellRenderParams: {
			formatter: userApplicationStateClientRegistry.getFormatter('percent'),
			isProgress: () => false,
			positiveColor: () => 'bar-cell-progress' as 'info'
		},
		sortable: true
	}),

]);