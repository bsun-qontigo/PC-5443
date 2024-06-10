import { MenuItemDef } from '@ag-grid-community/all-modules';
import { GetContextMenuItemsParams } from '@axioma-types/grid-wrapper';
import { WealthBatchJobRO } from '@axioma/wealth-types';

export function getContextMenuItems(params: GetContextMenuItemsParams<WealthBatchJobRO>): (string | MenuItemDef)[] {
	if (!params.context.gridApi) {
		return [];
	}

	return [
		'copyWithHeaders',
		'copyCellValue'
	];
}