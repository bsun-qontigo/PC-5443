import { DateTime } from 'luxon';
import { SingleExcelDownloadRequest } from '@axioma/wealth-types';
import { plugins } from '@axioma/common';
import { ExportHelpers } from '@axioma/wealth-commons';
import { Context } from '../../type';
import { keyToI18n } from '@axioma-components/wealth-space-view-selector';

export async function createSingleExcelDownloadRequest(context: Context): Promise<SingleExcelDownloadRequest> {
	const rowsSelected = context.gridApi().getSelectedRows();
	let onlySelected = true;
	if (rowsSelected.length === 0) {
		onlySelected = false;
	}
	const pfData = await context.portfolioData();
	const contextDate = pfData.date;
	const date = contextDate ? contextDate.toJSDate() : DateTime.now().toJSDate();
	const opts = {
		all: !onlySelected,
		columnKeys: context.columnApi().getAllColumns()?.map(c => c.getColId())
	};
	const data = ExportHelpers.getDataToExport(context.gridApi(), context.columnApi(), opts);
	data.customFormatting = ['', '', ExportHelpers.getFormatterText('percent')];
	data.formatterNames = ['', '', 'percent'];
	return {
		isMultiple: false,
		props: {
			creator: 'Axioma',
			lastModifiedBy: 'Axioma',
			created: date,
			modified: date,
			lastPrinted: date,
		},
		sheetHeaders: [
			`${plugins.lang.t('DATE').toString()}`, date,
			`${plugins.lang.t('STRATEGY_NAME').toString()}`, pfData.strategyName ?? '',
			`${plugins.lang.t('PORTFOLIO').toString()}`, pfData.identity ?? '',
			`${plugins.lang.t('VIEW').toString()}`, keyToI18n(context.view()),
			`${plugins.lang.t('TYPE').toString()}`, keyToI18n(context.type()),
		],
		key: `top10Holdings`,
		name: plugins.lang.t('EXPORT.TOP_10_HOLDINGS').toString(),
		data
	};
}
