import { MenuItemDef } from '@ag-grid-community/all-modules';
import { Grid } from '@axioma-framework/grid-wrapper';
import { GetContextMenuItemsParams } from '@axioma-types/grid-wrapper';
import { plugins } from '@axioma/common';
import { Context, Top10Holdings } from '../type';
import { ExcelDownloader } from './downloaders/excel';
import { fsDownloadCSV, fsDownloadExcel } from '../utils/fsEvents';

export function getContextMenuItems(params: GetContextMenuItemsParams<Top10Holdings>, context: Context): (string | MenuItemDef)[] {
	const api = params.api;
	if (!api) {
		return [];
	}

	const exportName = `top_10_holdings`;
	const contextMenu: (string | MenuItemDef)[] = [];
	const exportToCsv = (): (params: GetContextMenuItemsParams<Top10Holdings>) => MenuItemDef => {
		const original = Grid.exportToCsv(() => {
			return {
				fileName: `${exportName}_${new Date().toUTCString()}.csv`,
				allColumns: true
			};
		});
		const _exportToCsv = (params: GetContextMenuItemsParams<Top10Holdings>) => {
			const result = original(params);
			const action = result.action;
			result.action = () => {
				fsDownloadCSV();
				action?.();
			};
			return result;
		};
		return _exportToCsv;
	};

	contextMenu.push(
		'copy',
		'copyWithHeaders',
		'selectAll',
		'separator',
		{
			name: plugins.lang.t('CONTEXT_MENU.EXPORT').toString(),
			subMenu: [
				{
					name: plugins.lang.t('DOWNLOAD_MENU.DOWNLOAD_EXCEL').toString(),
					action: (): void => {
						fsDownloadExcel();
						new ExcelDownloader(context).download();
					},
					cssClasses: ['qf-excelExport']
				},
				exportToCsv()
			]
		}
	);

	return contextMenu;
}