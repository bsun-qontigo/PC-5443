import { MenuItemDef } from '@ag-grid-community/all-modules';
import { plugins } from '@axioma/common';
import { CsvDownloader } from './downloaders/csv';
import { ExcelDownloader } from './downloaders/excel';
import { fsCSVDownload, fsDownloadWorkspace, fsMultipleDownload, fsSingleDownload } from '../utils/fsEvents';
import { Context } from './type';

export function getContextMenuItems(context: Context): (string | MenuItemDef)[] {
	return [
		'copyWithHeaders',
		'copyCellValue',
		'separator',
		{
			name: plugins.lang.t('CONTEXT_MENU.EXPORT').toString(),
			subMenu: [
				{
					name: plugins.lang.t('DOWNLOAD_MENU.DOWNLOAD_EXCEL').toString(),
					action: (): void => {
						fsSingleDownload();
						new ExcelDownloader(context, true).download();
					},
					cssClasses: ['qf-excelExport']
				},
				{
					name: plugins.lang.t('DOWNLOAD_MENU.DOWNLOAD_ALL_EXCEL').toString(),
					action: (): void => {
						fsMultipleDownload();
						new ExcelDownloader(context, false).download();
					},
					cssClasses: ['qf-excelExport']
				},
				{
					name: plugins.lang.t('DOWNLOAD_MENU.DOWNLOAD_CSV').toString(),
					action: (): void => {
						fsCSVDownload();
						new CsvDownloader(context).download();
					},
					cssClasses: ['qf-csvExport']
				},
				{
					name: plugins.lang.t('DOWNLOAD_MENU.DOWNLOAD_WORKSPACE').toString(),
					action: (): void => {
						fsDownloadWorkspace();
						context.workspaceDownload();
					},
					cssClasses: ['qf-workspace-export']
				}
			]
		},
	];
}