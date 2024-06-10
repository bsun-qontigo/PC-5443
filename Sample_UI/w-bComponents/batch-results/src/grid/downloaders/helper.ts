import { Context } from '../type';
import { Toast, ToastHandler } from '@axioma-framework/qontum';
import { compile, ParentHandler, createOneWayBinding } from '@axioma/vue';
import { wealthTaskClientRegistry } from '@axioma-api/wealth-task';
import { downloadAsZip } from '@axioma/wealth-services';
import { DateTime } from 'luxon';
import { SingleExcelDownloadRequest, WealthExtendedBatchOptimizationEntryOutputRO } from '@axioma/wealth-types';
import { plugins } from '@axioma/common';
import { ExportHelpers } from '@axioma/wealth-commons';

const { supportExport, isColumnVisible, toColumnKey } = ExportHelpers;
const ToastStates = ['error', 'warning', 'success', 'info'] as const;
export type ToastState = typeof ToastStates[number];

export const getColumnKeysForExport = (context: Context): string[] => {
	return (context.columnApi().getAllColumns() || [])
		.filter(supportExport)
		.filter(isColumnVisible)
		.map(toColumnKey);
};

export function showToast(elm: () => HTMLElement, state: ToastState, content: string): void {
	const handlerToast: ParentHandler<ToastHandler, 'state' | 'content'> = createOneWayBinding<ToastHandler>()
		.owned('state', state)
		.owned('content', content)
		.byRef('id', () => 0)
		.byRef('elapsed', () => 4000)
		.byRef('isActive', () => true)
		.on('onClose', () => notification.destroy())
		.on('onCompleted', () => notification.destroy())
		.on('onPaused', () => { return; })
		.on('onResumed', () => { return; })
		.create();
	const newDiv = document.createElement('div');
	newDiv.setAttribute('style', 'position: absolute; top: 1%; left: 50%; transform: translate(-50%, -1%)');
	elm().appendChild(newDiv);
	const notification = compile({
		el: newDiv,
		component: Toast,
		propsData: {
			handler: handlerToast
		}
	});
}

type TradeListExportParams = {
	context: Context;
	zipFilename: string;
	initiators: Required<Pick<WealthExtendedBatchOptimizationEntryOutputRO, 'accountName'>>[];
}
export function downloadTradeList(params: TradeListExportParams): Promise<unknown> {
	const { context, zipFilename, initiators } = params;
	const date = context.date();
	return wealthTaskClientRegistry.getTradeList(context.strategyName(), (date.some && date.value) as DateTime, initiators.map(i => i.accountName))
		.then(results => {
			const accountsWithTradeList = Object.keys(results);
			if (accountsWithTradeList.length > 0) {
				const requests = accountsWithTradeList.map(acct => ({
					fileContent: new Blob([JSON.stringify(results[acct], undefined, 2)], { type: 'application/json;charset=utf-8' }),
					filename: `${acct}_TradeList`,
					fileExtension: 'json'
				}));
				return downloadAsZip(requests, zipFilename)
					.then(() => {
						showToast(context.element, 'info', plugins.lang.t('BATCH_RESULTS.DOWNLOAD_TRADE_LIST').toString());
					});
			} else {
				// happy path atm;
				return Promise.resolve();
			}
		});
}

export function createSingleExcelDownloadRequest(context: Context): SingleExcelDownloadRequest {
	const contextDate = context.date();
	const date = contextDate.some ? contextDate.value.toJSDate() : DateTime.now().toJSDate();
	const data = ExportHelpers.getDataToExport(context.gridApi(), context.columnApi(), { all: true });
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
			`${plugins.lang.t('DATE').toString()}`, date, `${plugins.lang.t('BATCH_RESULTS.STRATEGY_NAME').toString()}`, context.strategyName()
		],
		key: `${context.strategyName()}`,
		name: `${context.strategyName()}`,
		data
	};
}
