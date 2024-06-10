import { MenuItemDef } from '@ag-grid-community/all-modules';
import { Grid } from '@axioma-framework/grid-wrapper';
import { GetContextMenuItemsParams } from '@axioma-types/grid-wrapper';
import { plugins } from '@axioma/common';
import { WealthLensColumn } from '@axioma/wealth-commons';

export function getContextMenuItems(params: GetContextMenuItemsParams<WealthLensColumn.WealthLensDrivers>): (string | MenuItemDef)[] {
	const api = params.api;
	if (!api) {
		return [];
	}

	const exportName = `${plugins.lang.t('WEALTH_LENS_DRIVERS.EXPORT_NAME').toString()}`;
	const contextMenu: (string | MenuItemDef)[] = [];
	contextMenu.push(
		'copy',
		'copyWithHeaders',
		'selectAll',
		'separator',
		{
			name: plugins.lang.t('CONTEXT_MENU.EXPORT').toString(),
			subMenu: [
				Grid.exportToExcel(() => {
					return {
						fileName: `${exportName}_${new Date().toUTCString()}.xlsx`,
						sheetName: exportName
					};
				}),
				Grid.exportToCsv(() => {
					return {
						fileName: `${exportName}_${new Date().toUTCString()}.csv`
					};
				})
			]
		}
	);

	return contextMenu;
}