import { AnalyticsSupportLots, Context, GridLotsSelectorToggle, LotsSelectorToggle, SupportLotsType, WealthAnalyticsColDefs, WealthAnalyticsRO, WealthLotsAnalyticsRO, WealthLotsAnalyticsROArray, WealthAssetTypeAnalyticsROArray, WealthAssetTypeAnalyticsRO } from '../type';
import { Column } from '@ag-grid-community/all-modules';
import { Toast, ToastHandler } from '@axioma-framework/qontum';
import { compile, ParentHandler, createOneWayBinding } from '@axioma/vue';
import { ExportHelpers, GridTypeToggle, GridTypeToggleType } from '@axioma/wealth-commons';
import { DateTime } from 'luxon';
import { plugins } from '@axioma/common';
import { GridHelpers } from '@axioma-framework/grid-wrapper';
import { ClassificationDTO, IDataToExport, IRowTracking, MultipleExcelDownloadRequest, SingleExcelDownloadRequest, WealthAssetAnalyticsRO, WealthHoldingLotAnalyticsRO, WealthInitialvsFinalAnalyticsRO, WealthPortfolioDrillDownRO, WealthTradeAnalyticsRO, WealthTransactionLotAnalyticsRO, WorksheetRequest } from '@axioma/wealth-types';
import type { GridApi, RowNode, ColDef } from '@axioma-types/grid-wrapper';
import { gridColumns, initialFinalColumns, lotsGridColumns, tradeListColumns, tradeListLotsColumns } from '../column';
import { getField, getTopN } from '@axioma-components/wealth-top-10-holdings';
import { WealthDataSpace, WealthDataView } from '@axioma-components/wealth-space-view-selector';
import { RowModel, CellModel, Worksheet } from 'exceljs';
import { addRowBold } from '@axioma/wealth-services';

const ToastStates = ['error', 'warning', 'success', 'info'] as const;
export type ToastState = typeof ToastStates[number];

export const getColumnKeysForExport = (context: Context): string[] => {
	return (context.columnApi().getAllColumns() || [])
		.filter(c => isColumnVisible(c, context.selectedGroupBy !== null))
		.map(toColumnKey);
};

export function isColumnVisible(c: Column, isGroupBy: boolean): boolean {
	return isGroupBy ? c.isVisible() || isGroupingColumn(c) : c.isVisible();
}

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

const gridTypeDesc = (type: GridTypeToggleType): string => {
	switch (type) {
		case 'original':
			return plugins.lang.t('PORTFOLIO_TABLE.ORIGINAL').toString();
		case 'tradeList':
			return plugins.lang.t('PORTFOLIO_TABLE.TRADE_LIST').toString();
		case 'initialFinal':
			return plugins.lang.t('PORTFOLIO_TABLE.INITIAL_FINAL').toString();
		case 'final':
		default:
			return plugins.lang.t('PORTFOLIO_TABLE.FINAL').toString();
	}
};
const gridLotsTypeDesc = (lotsType: GridLotsSelectorToggle): string => {
	switch (lotsType) {
		case 'taxLots':
			return plugins.lang.t('PORTFOLIO_TABLE.TAX_LOTS').toString();
		case 'positions':
		default:
			return plugins.lang.t('PORTFOLIO_TABLE.POSITIONS').toString();
	}
};

export function isGroupingColumn(column: Column | ColDef<WealthAssetAnalyticsRO>): boolean {
	return (column as Column).getColId?.() === 'assetId' || (column as ColDef<WealthAssetAnalyticsRO>).colId === 'assetId';
}

// indentation based output;
export const exportCellValueGetterForGroupingColumn = (gridApi: GridApi<WealthAssetTypeAnalyticsRO>, column: Column, node: RowNode<unknown>): string => {
	if (!node) {
		return '';
	}
	let value: string;
	const indentation = Array(node.level + 1).join('  ');
	if (node.group) {
		value = indentation + (node.key ?? '');
	} else {
		value = indentation + gridApi.getValue(column, node);
	}
	return value;
};

export async function createSingleExcelDownloadRequest(context: Context): Promise<SingleExcelDownloadRequest> {
	return Promise.all([context.gridReadyEvent(), context.portfolioData()])
		.then(([, pfData]) => {
			const contextDate = context.date();
			const date = contextDate.some ? contextDate.value.toJSDate() : DateTime.now().toJSDate();
			const gridApi = context.gridApi();
			const opts: ExportHelpers.ExcelExportOpts = {
				all: true,
				columnKeys: context.columnApi().getAllColumns()?.filter(c => c.isVisible() || isGroupingColumn(c)).map(c => c.getColId()),
				cellValueGetter: (column, node) => {
					if (isGroupingColumn(column)) {
						return exportCellValueGetterForGroupingColumn(gridApi, column, node);
					} else {
						return gridApi.getValue(column, node);
					}
				},
				excelColumnFormatters: {
					'buyDate': (d: DateTime) => d.toJSDate()
				} as ExportHelpers.ExcelColumnFormatters
			};
			const data = ExportHelpers.getDataToExport(context.gridApi(), context.columnApi(), opts);
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
					`${plugins.lang.t('STRATEGY_NAME').toString()}`, context.strategyName(),
					`${plugins.lang.t('PORTFOLIO').toString()}`, pfData.identity as string,
					`\r\n`,
					`${plugins.lang.t('VIEW').toString()}`, gridTypeDesc(context.gridType()),
					`${plugins.lang.t('TYPE').toString()}`, gridLotsTypeDesc(context.gridLotsType()),
					...context.selectedGroupBy() ? [`${plugins.lang.t('PORTFOLIO_TABLE.GROUP_BY').toString()}`, [context.riskModel(), (pfData.classificationDTO || [] as unknown as ClassificationDTO).find(c => c.key === context.selectedGroupBy())?.name as string].join('.')] : []
				],
				name: `${context.strategyName()}`,
				key: `${context.strategyName()}`,
				data
			};
		});
}

export async function createMultipleExcelDownloadRequest(context: Context): Promise<MultipleExcelDownloadRequest> {
	const contextDate = context.date();
	const date = contextDate.some ? contextDate.value.toJSDate() : DateTime.now().toJSDate();
	const sheets: WorksheetRequest[] = [];
	await Promise.all([context.gridReadyEvent(), context.portfolioData()])
		.then(([e, pfData]) => {
			const promises: Promise<unknown>[] = [];
			const sheetHeaders = [
				`${plugins.lang.t('DATE').toString()}`, date,
				`${plugins.lang.t('STRATEGY_NAME').toString()}`, context.strategyName(),
				`${plugins.lang.t('PORTFOLIO').toString()}`, pfData.identity as string,
			];
			GridTypeToggle.forEach(type => {
				(type !== 'initialFinal' ? LotsSelectorToggle : [LotsSelectorToggle[0]]).forEach(lotsType => {
					let colDefs: WealthAnalyticsColDefs;
					switch (type) {
						case 'original':
							colDefs = lotsType === 'taxLots' ? GridHelpers.getColDefsByHandleOptions(lotsGridColumns(), e) : GridHelpers.getColDefsByHandleOptions(gridColumns(), e);
							break;
						case 'tradeList':
							colDefs = lotsType === 'taxLots' ? GridHelpers.getColDefsByHandleOptions(tradeListLotsColumns(), e) : GridHelpers.getColDefsByHandleOptions(tradeListColumns(), e);
							break;
						case 'initialFinal':
							colDefs = GridHelpers.getColDefsByHandleOptions(initialFinalColumns(), e);
							break;
						case 'final':
						default:
							colDefs = lotsType === 'taxLots' ? GridHelpers.getColDefsByHandleOptions(lotsGridColumns(), e) : GridHelpers.getColDefsByHandleOptions(gridColumns(), e);
					}
					promises.push(getDataToExport(context, colDefs, true, type, lotsType).then(data => {
						sheets.push({
							key: [type, lotsType].join(','),
							name: [gridLotsTypeDesc(lotsType), gridTypeDesc(type)].join(' - '),
							sheetHeaders,
							data
						});
					}));
				});
			});

			return Promise.all(promises).then(() => {
				getAllocations(pfData, sheetHeaders, sheets);
				getTop10Holdings(pfData, plugins.lang.t('EXPORT.TOP_10_HOLDINGS').toString(), sheetHeaders, sheets);
			});
		});

	return {
		isMultiple: true,
		props: {
			creator: 'Axioma',
			lastModifiedBy: 'Axioma',
			created: date,
			modified: date,
			lastPrinted: date,
		},
		sheets
	};
}

function getAllocations(data: WealthPortfolioDrillDownRO | undefined, sheetHeaders: (string | Date)[], sheets: WorksheetRequest[]): WorksheetRequest[] {
	if (data && data.sectorAllocationInitial && data.sectorAllocationFinal && data.sectorActiveAllocationInitial && data.sectorActiveAllocationFinal) {
		const classification = data.classification ? data.classification : '';
		sheetHeaders = sheetHeaders.concat(plugins.lang.t('EXPORT.CLASSIFICATION').toString(), classification);
		const formattedData: string[][] = [];
		const sheetName = plugins.lang.t('EXPORT.SECTOR_ALLOCATION').toString();
		Object.keys(data.sectorAllocationInitial).forEach(key => {
			const rowData = [
				key,
				data.sectorAllocationInitial ? data.sectorAllocationInitial[key].toString() : '',
				data.sectorAllocationFinal ? data.sectorAllocationFinal[key].toString() : '',
				data.sectorActiveAllocationInitial ? data.sectorActiveAllocationInitial[key].toString() : '',
				data.sectorActiveAllocationFinal ? data.sectorActiveAllocationFinal[key].toString() : ''
			];
			formattedData.push(rowData);
		});
		sheets.push({
			key: sheetName,
			name: sheetName,
			data: {
				data: formattedData,
				headers: [
					plugins.lang.t('EXPORT.SECTOR').toString(),
					plugins.lang.t('EXPORT.SECTOR_ALLOCATION_INITIAL').toString(),
					plugins.lang.t('EXPORT.SECTOR_ALLOCATION_FINAL').toString(),
					plugins.lang.t('EXPORT.SECTOR_ACTIVE_ALLOCATION_INITIAL').toString(),
					plugins.lang.t('EXPORT.SECTOR_ACTIVE_ALLOCATION_FINAL').toString()
				],
				customFormatting: ['', ExportHelpers.getFormatterText('percent'), ExportHelpers.getFormatterText('percent'), ExportHelpers.getFormatterText('percent'), ExportHelpers.getFormatterText('percent')],
				formatterNames: []
			},
			sheetHeaders
		});
	}
	return sheets;
}

function getTop10Holdings(pfData: WealthPortfolioDrillDownRO, sheetName: string, sheetHeaders: (string | Date)[], sheets: WorksheetRequest[]): WorksheetRequest[] {
	if (pfData) {
		const formattedData: Partial<RowModel & { role: string }>[] = [];
		const columnGapValues = [{ value: '' }, { value: '' }, { value: '' }, { value: '' }, { value: '' }];
		const columnGapStrs = columnGapValues.map(() => '');
		(['initial', 'final'] as WealthDataView[]).forEach(view => {
			if (view === 'initial') {
				formattedData.push({
					cells: [{ value: '' }, { value: plugins.lang.t('EXPORT.INITIAL_NET').toString() }, ...columnGapValues, { value: '' }, { value: plugins.lang.t('EXPORT.INITIAL_ACTIVE').toString() }] as CellModel[],
					style: { font: { bold: true } },
					role: 'header'
				});
				formattedData.push({
					cells: [{ value: plugins.lang.t('POSITION').toString() }, { value: plugins.lang.t('ALLOCATION').toString() }, ...columnGapValues, { value: plugins.lang.t('POSITION').toString() }, { value: plugins.lang.t('ALLOCATION').toString() }] as CellModel[],
					style: { font: { bold: true } },
					role: 'header'
				});
			} else {
				formattedData.push({
					cells: [{ value: '' }, { value: plugins.lang.t('EXPORT.FINAL_NET').toString() }, ...columnGapValues, { value: '' }, { value: plugins.lang.t('EXPORT.FINAL_ACTIVE').toString() }] as CellModel[],
					style: { font: { bold: true } },
					role: 'header'
				});
				formattedData.push({
					cells: [{ value: plugins.lang.t('POSITION').toString() }, { value: plugins.lang.t('ALLOCATION').toString() }, ...columnGapValues, { value: plugins.lang.t('POSITION').toString() }, { value: plugins.lang.t('ALLOCATION').toString() }] as CellModel[],
					style: { font: { bold: true } },
					role: 'header'
				});
			}
			let space = 'total' as WealthDataSpace;
			const totals = getTopN(pfData, view, space).map(v => {
				return {
					description: v.description as string,
					allocation: v[getField(space)] as number
				};
			});
			space = 'active' as WealthDataSpace;
			const actives = getTopN(pfData, view, space).map(v => {
				return {
					description: v.description as string,
					allocation: v[getField(space)] as number
				};
			});
			for (let i = 0; i < totals.length; i++) {
				const total = totals[i];
				const active = actives[i];
				formattedData.push({
					cells: [{ value: total.description }, { value: total.allocation }, ...columnGapValues, { value: active.description }, { value: active.allocation }] as CellModel[]
				});
			}
			const rowGaps = 3;
			for (let i = 0; i < rowGaps; i++) {
				formattedData.push({
					cells: []
				});
			}
		});
		sheets.push({
			key: 'top10Holdings',
			name: sheetName,
			data: {
				data: formattedData,
				headers: [],
				customFormatting: ['', ExportHelpers.getFormatterText('percent'), ...columnGapStrs, '', ExportHelpers.getFormatterText('percent')],
				formatterNames: ['', 'percent', ...columnGapStrs, '', 'percent'],
			},
			eachRow: (rowTracking: IRowTracking, worksheet: Worksheet, formatting: string[], formatterNames: string[], row: string[] | Partial<RowModel & { role: string }>, _index: number): void => {
				row = row as Partial<RowModel & { role: string }>;
				worksheet.addRow((row.cells ?? []).map(c => c.value));
				const rowAdded = worksheet.getRow(rowTracking.getter());
				if (row.role === 'header') {
					if (row.style?.font?.bold) {
						addRowBold(rowTracking.getter(), worksheet);
					}
				} else {
					rowAdded.eachCell((cell, idx) => {
						if (formatting[idx - 1] && formatting[idx - 1] !== '' && cell.value !== '') {
							if (formatterNames[idx - 1]?.toLowerCase() === 'percent') {
								cell.value = Number(cell.value) / 100;
							} else {
								cell.value = Number(cell.value);
							}
							cell.numFmt = formatting[idx - 1];
						}
					});
				}
				rowTracking.increment();
			},
			sheetHeaders
		});
	}
	return sheets;
}

export function toColumnKey(c: unknown): string {
	return (c as Record<'colId', string>).colId ?? (c as Record<'getColId', () => string>).getColId?.() as string;
}

export function generateAssetAnalytics(type: 'original', pfData: WealthPortfolioDrillDownRO): WealthAssetAnalyticsRO[];
export function generateAssetAnalytics(type: 'tradeList', pfData: WealthPortfolioDrillDownRO): WealthTradeAnalyticsRO[];
export function generateAssetAnalytics(type: 'initialFinal', pfData: WealthPortfolioDrillDownRO): WealthInitialvsFinalAnalyticsRO[];
export function generateAssetAnalytics(type: 'final', pfData: WealthPortfolioDrillDownRO): WealthAssetAnalyticsRO[];
export function generateAssetAnalytics(type: GridTypeToggleType, pfData: WealthPortfolioDrillDownRO): WealthAssetTypeAnalyticsROArray;
export function generateAssetAnalytics(type: GridTypeToggleType, pfData: WealthPortfolioDrillDownRO): WealthAssetTypeAnalyticsROArray {
	switch (type) {
		case 'original':
			return pfData.assetDetailsInitial ?? [];
		case 'tradeList':
			return pfData.tradeDetails ?? [];
		case 'initialFinal':
			return pfData.assetDetailsInitialvsFinal ?? [];
		case 'final':
		default:
			return pfData.assetDetailsFinal ?? [];
	}
}
type LotsGetter<O extends AnalyticsSupportLots, T extends WealthLotsAnalyticsRO> = (obj: O) => T[];
const reducerFactory = <O extends AnalyticsSupportLots, T extends WealthLotsAnalyticsRO>(lotsGetter: LotsGetter<O, T>) => ((acc: T[], obj: O) => {
	const lots = lotsGetter(obj);
	if (lots) {
		acc.push(...lots);
	}
	return acc;
});

export function generateLotsAnalytics(type: 'original', pfData: WealthPortfolioDrillDownRO): WealthHoldingLotAnalyticsRO[];
export function generateLotsAnalytics(type: 'tradeList', pfData: WealthPortfolioDrillDownRO): WealthTransactionLotAnalyticsRO[];
export function generateLotsAnalytics(type: 'final', pfData: WealthPortfolioDrillDownRO): WealthHoldingLotAnalyticsRO[];
export function generateLotsAnalytics(type: SupportLotsType, pfData: WealthPortfolioDrillDownRO): WealthLotsAnalyticsROArray;
export function generateLotsAnalytics(type: SupportLotsType, pfData: WealthPortfolioDrillDownRO): WealthLotsAnalyticsROArray {
	const data = generateAssetAnalytics(type, pfData);
	if (type === 'tradeList') {
		return (data as WealthTradeAnalyticsRO[]).reduce(reducerFactory((obj: WealthTradeAnalyticsRO) => (obj.transactionLotAnalytics ?? [])), []);
	} else if (type === 'original' || type === 'final') {
		return (data as WealthAssetAnalyticsRO[]).reduce(reducerFactory((obj: WealthAssetAnalyticsRO) => (obj.holdingLotAnalytics ?? [])), []);
	} else {
		throw new Error(`Unspupported type: ${type}`);
	}
}

async function getDataToExport(context: Context, colDefs: WealthAnalyticsColDefs, all: boolean, type: GridTypeToggleType, lotsType: GridLotsSelectorToggle): Promise<IDataToExport> {
	const data: string[][] = [];
	const allColumns = (colDefs || []);
	const customFormatting = ExportHelpers.getCustomFormatting<WealthHoldingLotAnalyticsRO>(colDefs);
	const pfData = await context.portfolioData();
	const columnsHeader = allColumns.map(c => c.headerName ?? '');
	if (all) {
		let tableData;
		if (lotsType === 'taxLots') {
			tableData = generateLotsAnalytics(type as SupportLotsType, pfData);
		} else {
			tableData = generateAssetAnalytics(type, pfData);
		}
		tableData.forEach(rowData => {
			const r: string[] = [];
			allColumns.forEach(column => {
				const colId = column.colId as keyof WealthAnalyticsRO;
				if (colId as keyof WealthLotsAnalyticsRO === 'buyDate') {
					const _rowData = (rowData as unknown as WealthLotsAnalyticsRO);
					const buyDate = _rowData[colId] as unknown as DateTime;
					r.push(buyDate.toJSDate() as unknown as string);
				} else {
					r.push(rowData[colId as keyof typeof rowData] as string);
				}
			});
			data.push(r);
		});
	} else {
		// TODO ignore filter for now;
	}

	return {
		headers: columnsHeader,
		data,
		...customFormatting
	};
}