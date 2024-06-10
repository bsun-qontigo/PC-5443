import { MenuItemDef } from '@ag-grid-community/all-modules';
import { plugins } from '@axioma/common';
import { GetContextMenuItemsParams } from '@axioma-types/grid-wrapper';
import { WealthExtendedBatchOptimizationEntryOutputRO } from '@axioma/wealth-types';
import { CsvDownloader } from './downloaders/csv';
import { Context } from './type';
import { TradeListDownloader } from './downloaders/tradeList';
import { fsDownloadCSV, fsDownloadExcel, fsDownloadTradeList, fsDownloadWorkspace, fsOpenDownloadPanel, fsOpenDrillDown } from '../utils/fsEvents';
import { ExcelDownloader } from './downloaders/excel';
import { allowOpenPortfolioDrilldown } from '.';

export function getContextMenuItems(params: GetContextMenuItemsParams<WealthExtendedBatchOptimizationEntryOutputRO>, context: Context): (string | MenuItemDef)[] {
	const maybeOpenPf = [];
	if (allowOpenPortfolioDrilldown(params.node.data)) {
		maybeOpenPf.push({
			name: plugins.lang.t('DOWNLOAD_MENU.OPEN_PORTFOLIO_TAB').toString(),
			action: (): void => {
				fsOpenDrillDown();
				context.openPortfolioTab(params.node.data);
			},
			cssClasses: ['qf-open-portfolio']
		} as MenuItemDef);
	}
	return [
		...maybeOpenPf,
		'copyWithHeaders',
		'copyCellValue',
		'separator',
		{
			name: plugins.lang.t('DOWNLOAD_MENU.OPEN_DOWNLOAD_TAB').toString(),
			action: (): void => {
				fsOpenDownloadPanel();
				context.openDownloadPanel();
			},
			cssClasses: ['qf-open-download']
		},
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
				{
					name: plugins.lang.t('DOWNLOAD_MENU.DOWNLOAD_CSV').toString(),
					action: (): void => {
						fsDownloadCSV();
						new CsvDownloader(context).download();
					},
					cssClasses: ['qf-csvExport']
				},
				...(context.rowSelected() ? [
					{
						name: plugins.lang.t('DOWNLOAD_MENU.DOWNLOAD_WORKSPACE').toString(),
						action: (): void => {
							fsDownloadWorkspace();
							context.workspaceDownload();
						},
						disabled: !context.rowSelected(),
						cssClasses: ['qf-workspace-export']
					},
					{
						name: plugins.lang.t('DOWNLOAD_MENU.DOWNLOAD_TRADE_LIST').toString(),
						action: (): void => {
							fsDownloadTradeList();
							context.isDownloadingTradeList = true;
							new TradeListDownloader(context).download()
								.catch(/**TODO */)
								.finally(() => {
									context.isDownloadingTradeList = false;
								});
						},
						disabled: !context.rowSelected(),
						cssClasses: ['qf-trade-list-export']
					}] : [])
			]
		},

	];
}