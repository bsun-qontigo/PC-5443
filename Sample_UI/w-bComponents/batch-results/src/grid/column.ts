import { DateColumn, TextColumn, NumberColumn, GridHelpers, BadgeTextColumn, HtmlColumn } from '@axioma-framework/grid-wrapper';
import type { BadgeColor, ICellRendererParams, HandleOptions, ValueGetterParams, CellToStringParams, ColumnGetterSetter, columns } from '@axioma-types/grid-wrapper';
import { plugins } from '@axioma/common';
import { Context } from './type';
import { BatchTranslation } from '@axioma/wealth-services';
import { WealthExtendedBatchOptimizationEntryOutputRO } from '@axioma/wealth-types';
import { WealthLensColumn, getNumberCellRenderParams, healthScoreColumnBadge, healthScoreDriverColumnBadge } from '@axioma/wealth-commons';
import { ColumnStateDTO } from '../columnStateDTO';

type AccountColumnOptions = Omit<Omit<Parameters<typeof HtmlColumn.create<WealthExtendedBatchOptimizationEntryOutputRO>>[0], 'field'>,
	keyof columns.FuzzyOptions<WealthExtendedBatchOptimizationEntryOutputRO, WealthExtendedBatchOptimizationEntryOutputRO>>
	& Omit<columns.TextColumnOption<WealthExtendedBatchOptimizationEntryOutputRO>, 'field'>
	& { field: Omit<ColumnGetterSetter<string, WealthExtendedBatchOptimizationEntryOutputRO>, 'setter'>; }
	& { format?: unknown };

type P =
	| Parameters<typeof TextColumn.create<WealthExtendedBatchOptimizationEntryOutputRO>>[0]
	| Parameters<typeof NumberColumn.create<WealthExtendedBatchOptimizationEntryOutputRO>>[0]
	| Parameters<typeof BadgeTextColumn.create<WealthExtendedBatchOptimizationEntryOutputRO>>[0]
	| Parameters<typeof WealthLensColumn.create<WealthExtendedBatchOptimizationEntryOutputRO>>[0]
	| Parameters<typeof DateColumn.create<WealthExtendedBatchOptimizationEntryOutputRO>>[0]
	| AccountColumnOptions
	;

const _columns: Array<{ _type: unknown; } & P> = [];

const _TextColumn = {
	create: (arg: Parameters<typeof TextColumn.create<WealthExtendedBatchOptimizationEntryOutputRO>>[0]) => {
		_columns.push({ _type: TextColumn, ...arg });
	}
};

const _NumberColumn = {
	create: (arg: Parameters<typeof NumberColumn.create<WealthExtendedBatchOptimizationEntryOutputRO>>[0]) => {
		_columns.push({ _type: NumberColumn, ...arg });
	}
};

const _BadgeTextColumn = {
	create: (arg: Parameters<typeof BadgeTextColumn.create<WealthExtendedBatchOptimizationEntryOutputRO>>[0]) => {
		_columns.push({ _type: BadgeTextColumn, ...arg });
	}
};

const _WealthLensColumn = {
	create: (arg: Parameters<typeof WealthLensColumn.create<WealthExtendedBatchOptimizationEntryOutputRO>>[0]) => {
		_columns.push({ _type: WealthLensColumn, ...arg });
	}
};

const _DateColumn = {
	create: (arg: Parameters<typeof DateColumn.create<WealthExtendedBatchOptimizationEntryOutputRO>>[0]) => {
		_columns.push({ _type: DateColumn, ...arg });
	}
};

const _AccountColumn = {
	create: (arg: AccountColumnOptions) => {
		_columns.push({ _type: HtmlColumn, ...arg } as unknown as { _type: unknown; } & P);
	}
};

// we use mapping as we need to format the graphs too.
const gridColumns = (context: Context): unknown[] => ([
	_AccountColumn.create({
		colId: 'accountName',
		field: {
			getter: node => {
				return node.data.accountName ?? '';
			}
		},
		checkboxSelection: true,
		headerCheckboxSelection: true,
		headerName: plugins.lang.t('BATCH_RESULTS.ACCOUNT_NAME').toString(),
		cellClassRules: {
			'batch-is-compliance': params => !!params.data.compliance,
		},
		cellClass: 'batch-account-name',
		flex: 1.2,
		lockPosition: true,
		headerCheckboxSelectionFilteredOnly: true,
		getGui: (item: WealthExtendedBatchOptimizationEntryOutputRO): HTMLElement => {
			const div = document.createElement('div');
			div.classList.add('display-flex', 'align-items-center', 'qontum-gap-sm');
			const span = document.createElement('span');
			span.textContent = item.accountName as string;
			span.classList.add('text-overflow-ellipsis', 'overflow-hidden');
			span.title = item.accountName as string;
			div.appendChild(span);
			if (item.compliance) {
				const icon = document.createElement('i');
				icon.classList.add('qontum-icon', 'fa', 'fa-clipboard-list-check');
				icon.title = plugins.lang.t('BATCH_RESULTS.COMPLIANCE_RULES_APPLIED').toString();
				div.appendChild(icon);
			}
			return div;
		},
		refresh: () => true
	}),
	_TextColumn.create({
		colId: 'compliance',
		field: {
			getter: node => {
				return node.data.compliance ? 'true' : 'false';
			}
		},
		valueGetter: params => params.data?.compliance ? 'true' : 'false',

		headerName: plugins.lang.t('BATCH_RESULTS.COMPLIANCE').toString(),
		editable: false,
		hide: true,
		flex: 1,
		suppressColumnsToolPanel: true,
		suppressFiltersToolPanel: true,
		suppressHeaderKeyboardEvent: () => true,
		suppressMenu: true,
		filter: 'agSetColumnFilter',
		filterParams: {
			keyCreator: (params: { value: string; }) => params.value ? 'true' : 'false',
			valueFormatter: (params: { value: unknown; }) => params.value ? 'true' : 'false'
		},
		lockPosition: true,
		headerCheckboxSelectionFilteredOnly: true
	}),
	_TextColumn.create({
		colId: 'id',
		field: 'workspaceId',
		headerName: plugins.lang.t('ID').toString(),
		editable: false,
		hide: true,
		flex: 1
	}),
	_NumberColumn.create({
		colId: 'marketValue',
		field: 'analytics.marketValue',
		headerName: plugins.lang.t(BatchTranslation['marketValue']).toString(),
		formatter: getNumberCellRenderParams('marketValue'),
		editable: false,
		sortable: true,
		flex: 1
	}),
	_WealthLensColumn.create({
		colId: 'healthScore',
		field: 'analytics.healthScore',
		headerName: plugins.lang.t(BatchTranslation['wealthLens']).toString(),
		valueGetter: healthScoreColumnValueGetter,
		onCellClicked: context.driverSidebar,
		badgeNumberCellRenderParams: {
			formatter: getNumberCellRenderParams('healthScore'),
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			badge: healthScoreColumnBadge as unknown as any,
		},
		filter: 'agMultiColumnFilter',
		filterParams: {
			filters: [
				{
					filter: 'agSetColumnFilter',
					filterParams: {
						values: [
							plugins.lang.t('BATCH_RESULTS.NO_SOLUTION').toString(),
							plugins.lang.t('BATCH_RESULTS.NO_REBALANCING').toString()
						]
					}
				},
				{
					filter: 'ag_NumberColumnFilter'
				}
			]
		},
		exportCellValue: (mode, params) => {
			const value = healthScoreColumnValueGetter(params);
			switch (mode) {
				case 'Clipboard':
					return sanitizeValue(value);
				case 'Csv':
					return sanitizeCsvValue(value);
				case 'Excel':
					return sanitizeValue(value);
				default:
					return '';
			}
		},
		editable: false,
		sortable: true,
		flex: 1
	}),
	_BadgeTextColumn.create({
		colId: 'maxSubscoreName',
		field: 'analytics.maxSubscoreName',
		headerName: plugins.lang.t(BatchTranslation['maxSubscoreName']).toString(),
		valueGetter: healthScoreDriverColumnValueGetter,
		onCellClicked: context.driverSidebar,
		badgeCellRenderParams: {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			badge: healthScoreDriverColumnBadge as unknown as any,
		},
		exportCellValue: (mode, params) => {
			return healthScoreDriverColumnValueGetter(params);
		},
		filter: 'agSetColumnFilter',
		editable: false,
		sortable: true,
		flex: 1
	}),
	_NumberColumn.create({
		colId: 'trackingError',
		field: 'analytics.trackingError',
		formatter: getNumberCellRenderParams('trackingError'),
		headerName: plugins.lang.t(BatchTranslation['trackingError']).toString(),
		editable: false,
		sortable: true,
		flex: 1,
		// TODO Gallery number column should combine this params
		filterParams: {
			inRangeInclusive: true
		}
	}),
	_NumberColumn.create({
		colId: 'trackingErrorDelta',
		field: 'analytics.trackingErrorDelta',
		formatter: getNumberCellRenderParams('trackingErrorDelta'),
		headerName: plugins.lang.t(BatchTranslation['trackingErrorDelta']).toString(),
		editable: false,
		sortable: true,
		flex: 1,
	}),
	_NumberColumn.create({
		colId: 'realizedGainsYTD',
		field: 'analytics.realizedGainsYTD',
		headerName: plugins.lang.t(BatchTranslation['realizedGainsYTD']).toString(),
		formatter: getNumberCellRenderParams('realizedGainsYTD'),
		editable: false,
		sortable: true,
		hide: true,
		flex: 1
	}),
	_NumberColumn.create({
		colId: 'realizedGainsYTDPercent',
		field: 'analytics.realizedGainsYTDPercent',
		formatter: getNumberCellRenderParams('realizedGainsYTDPercent'),
		headerName: plugins.lang.t(BatchTranslation['realizedGainsYTDPercent']).toString(),
		editable: false,
		sortable: true,
		flex: 1
	}),
	_NumberColumn.create({
		colId: 'realizedNetGainsDelta',
		field: 'analytics.realizedNetGainsDelta',
		headerName: plugins.lang.t(BatchTranslation['realizedNetGainsDelta']).toString(),
		formatter: getNumberCellRenderParams('realizedNetGainsDelta'),
		editable: false,
		sortable: true,
		hide: true,
		flex: 1
	}),
	_NumberColumn.create({
		colId: 'realizedNetGainsDeltaPercent',
		field: 'analytics.realizedNetGainsDeltaPercent',
		formatter: getNumberCellRenderParams('realizedNetGainsDeltaPercent'),
		headerName: plugins.lang.t(BatchTranslation['realizedNetGainsDeltaPercent']).toString(),
		editable: false,
		sortable: true,
		flex: 1,
	}),
	_NumberColumn.create({
		colId: 'unRealizedLossAvailable',
		field: 'analytics.unRealizedLossAvailable',
		formatter: getNumberCellRenderParams('unRealizedLossAvailable'),
		headerName: plugins.lang.t(BatchTranslation['unRealizedLossAvailable']).toString(),
		editable: false,
		sortable: true,
		hide: true,
		flex: 1
	}),
	_NumberColumn.create({
		colId: 'unRealizedLossAvailablePercent',
		field: 'analytics.unRealizedLossAvailablePercent',
		formatter: getNumberCellRenderParams('unRealizedLossAvailablePercent'),
		headerName: plugins.lang.t(BatchTranslation['unRealizedLossAvailablePercent']).toString(),
		editable: false,
		sortable: true,
		flex: 1,
	}),
	_NumberColumn.create({
		colId: 'deltaNetTaxLossOverTrackingErrorDelta',
		field: 'analytics.deltaNetTaxLossOverTrackingErrorDelta',
		formatter: getNumberCellRenderParams('deltaNetTaxLossOverTrackingErrorDelta'),
		headerName: plugins.lang.t(BatchTranslation['deltaNetTaxLossOverTrackingErrorDelta']).toString(),
		editable: false,
		sortable: true,
		flex: 1
	}),
	_NumberColumn.create({
		colId: 'netTaxLossOverTurnoverDelta',
		field: 'analytics.netTaxLossOverTurnoverDelta',
		formatter: getNumberCellRenderParams('netTaxLossOverTurnoverDelta'),
		headerName: plugins.lang.t(BatchTranslation['netTaxLossOverTurnoverDelta']).toString(),
		editable: false,
		sortable: true,
		flex: 1
	}),
	_NumberColumn.create({
		colId: 'numeraireCashIni',
		field: 'analytics.numeraireCashIni',
		formatter: getNumberCellRenderParams('numeraireCashIni'),
		headerName: plugins.lang.t(BatchTranslation['numeraireCashIni']).toString(),
		editable: false,
		sortable: true,
		flex: 1,
		hide: true
	}),
	_NumberColumn.create({
		colId: 'numeraireCash',
		field: 'analytics.numeraireCash',
		formatter: getNumberCellRenderParams('numeraireCash'),
		headerName: plugins.lang.t(BatchTranslation['numeraireCash']).toString(),
		editable: false,
		sortable: true,
		flex: 1
	}),
	_NumberColumn.create({
		colId: 'numeraireCashDelta',
		field: 'analytics.numeraireCashDelta',
		formatter: getNumberCellRenderParams('numeraireCashDelta'),
		headerName: plugins.lang.t(BatchTranslation['numeraireCashDelta']).toString(),
		editable: false,
		sortable: true,
		hide: true,
		flex: 1
	}),
	_NumberColumn.create({
		colId: 'turnoverPercent',
		field: 'analytics.turnoverPercent',
		formatter: getNumberCellRenderParams('turnoverPercent'),
		headerName: plugins.lang.t(BatchTranslation['turnoverPercent']).toString(),
		editable: false,
		sortable: true,
		flex: 1
	}),
	_BadgeTextColumn.create({
		colId: 'newAccount',
		field: {
			getter(node) {
				return node.data.newAccount ? 'New' : '';
			}
		},
		valueGetter: params => params.node?.data?.newAccount ? 'New' : '',
		badgeCellRenderParams: {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			badge: getNewAccoountBadgeColor,
		},
		filter: 'agSetColumnFilter',
		filterParams: {
			keyCreator: (params: { value: string; }) => params.value === 'New' ? 'New' : '',
			valueFormatter: (params: { value: unknown; }) => params.value ? params.value : ''
		},
		editable: false,
		headerName: plugins.lang.t(BatchTranslation['newAccount']).toString(),
		hide: true,
		sortable: true,
		flex: 1
	}),
	_NumberColumn.create({
		colId: 'cashFlow',
		field: 'cashFlow',
		headerName: plugins.lang.t(BatchTranslation['cashFlow']).toString(),
		formatter: getNumberCellRenderParams('cashFlow'),
		editable: false,
		sortable: true,
		hide: true,
		flex: 1
	}),
	_NumberColumn.create({
		colId: 'marketValueIni',
		field: 'analytics.marketValueIni',
		headerName: plugins.lang.t(BatchTranslation['marketValueIni']).toString(),
		formatter: getNumberCellRenderParams('marketValueIni'),
		editable: false,
		sortable: true,
		hide: true,
		flex: 1
	}),
	_NumberColumn.create({
		colId: 'namesIni',
		field: 'analytics.namesIni',
		headerName: plugins.lang.t(BatchTranslation['namesIni']).toString(),
		formatter: getNumberCellRenderParams('namesIni'),
		editable: false,
		sortable: true,
		hide: true,
		flex: 1
	}),
	_NumberColumn.create({
		colId: 'numeraireCashPctIni',
		field: 'analytics.numeraireCashPctIni',
		headerName: plugins.lang.t(BatchTranslation['numeraireCashPctIni']).toString(),
		formatter: getNumberCellRenderParams('numeraireCashPctIni'),
		editable: false,
		sortable: true,
		hide: true,
		flex: 1
	}),
	_NumberColumn.create({
		colId: 'betaIni',
		field: 'analytics.betaIni',
		headerName: plugins.lang.t(BatchTranslation['betaIni']).toString(),
		formatter: getNumberCellRenderParams('betaIni'),
		editable: false,
		sortable: true,
		hide: true,
		flex: 1
	}),
	_NumberColumn.create({
		colId: 'beta',
		field: 'analytics.beta',
		headerName: plugins.lang.t(BatchTranslation['beta']).toString(),
		formatter: getNumberCellRenderParams('beta'),
		editable: false,
		sortable: true,
		hide: true,
		flex: 1
	}),
	_NumberColumn.create({
		colId: 'betaDelta',
		field: 'analytics.betaDelta',
		headerName: plugins.lang.t(BatchTranslation['betaDelta']).toString(),
		formatter: getNumberCellRenderParams('betaDelta'),
		editable: false,
		sortable: true,
		hide: true,
		flex: 1
	}),
	_NumberColumn.create({
		colId: 'activeBetaIni',
		field: 'analytics.activeBetaIni',
		headerName: plugins.lang.t(BatchTranslation['activeBetaIni']).toString(),
		formatter: getNumberCellRenderParams('activeBetaIni'),
		editable: false,
		sortable: true,
		hide: true,
		flex: 1
	}),
	_NumberColumn.create({
		colId: 'activeBeta',
		field: 'analytics.activeBeta',
		headerName: plugins.lang.t(BatchTranslation['activeBeta']).toString(),
		formatter: getNumberCellRenderParams('activeBeta'),
		editable: false,
		sortable: true,
		hide: true,
		flex: 1
	}),
	_NumberColumn.create({
		colId: 'activeBetaDelta',
		field: 'analytics.activeBetaDelta',
		headerName: plugins.lang.t(BatchTranslation['activeBetaDelta']).toString(),
		formatter: getNumberCellRenderParams('activeBetaDelta'),
		editable: false,
		sortable: true,
		hide: true,
		flex: 1
	}),
	_NumberColumn.create({
		colId: 'unRealizedLossAvailablePctIni',
		field: 'analytics.unRealizedLossAvailablePctIni',
		headerName: plugins.lang.t(BatchTranslation['unRealizedLossAvailablePctIni']).toString(),
		formatter: getNumberCellRenderParams('unRealizedLossAvailablePctIni'),
		editable: false,
		sortable: true,
		hide: true,
		flex: 1,
	}),
	_NumberColumn.create({
		colId: 'unRealizedSTLossAvailableIni',
		field: 'analytics.unRealizedSTLossAvailableIni',
		headerName: plugins.lang.t(BatchTranslation['unRealizedSTLossAvailableIni']).toString(),
		formatter: getNumberCellRenderParams('unRealizedSTLossAvailableIni'),
		editable: false,
		sortable: true,
		hide: true,
		flex: 1
	}),
	_NumberColumn.create({
		colId: 'unRealizedSTLossAvailable',
		field: 'analytics.unRealizedSTLossAvailable',
		headerName: plugins.lang.t(BatchTranslation['unRealizedSTLossAvailable']).toString(),
		formatter: getNumberCellRenderParams('unRealizedSTLossAvailable'),
		editable: false,
		sortable: true,
		hide: true,
		flex: 1
	}),
	_NumberColumn.create({
		colId: 'unRealizedLTLossAvailableIni',
		field: 'analytics.unRealizedLTLossAvailableIni',
		headerName: plugins.lang.t(BatchTranslation['unRealizedLTLossAvailableIni']).toString(),
		formatter: getNumberCellRenderParams('unRealizedLTLossAvailableIni'),
		editable: false,
		sortable: true,
		hide: true,
		flex: 1
	}),
	_NumberColumn.create({
		colId: 'unRealizedLTLossAvailable',
		field: 'analytics.unRealizedLTLossAvailable',
		headerName: plugins.lang.t(BatchTranslation['unRealizedLTLossAvailable']).toString(),
		formatter: getNumberCellRenderParams('unRealizedLTLossAvailable'),
		editable: false,
		sortable: true,
		hide: true,
		flex: 1
	}),
	_NumberColumn.create({
		colId: 'taxLiabilityIni',
		field: 'analytics.taxLiabilityIni',
		headerName: plugins.lang.t(BatchTranslation['taxLiabilityIni']).toString(),
		formatter: getNumberCellRenderParams('taxLiabilityIni'),
		editable: false,
		sortable: true,
		hide: true,
		flex: 1
	}),
	_NumberColumn.create({
		colId: 'taxLiability',
		field: 'analytics.taxLiability',
		headerName: plugins.lang.t(BatchTranslation['taxLiability']).toString(),
		formatter: getNumberCellRenderParams('taxLiability'),
		editable: false,
		sortable: true,
		hide: true,
		flex: 1
	}),
	_NumberColumn.create({
		colId: 'realizedNetSTGLIni',
		field: 'analytics.realizedNetSTGLIni',
		headerName: plugins.lang.t(BatchTranslation['realizedNetSTGLIni']).toString(),
		formatter: getNumberCellRenderParams('realizedNetSTGLIni'),
		editable: false,
		sortable: true,
		hide: true,
		flex: 1
	}),
	_NumberColumn.create({
		colId: 'unRealizedSTGainsIni',
		field: 'analytics.unRealizedSTGainsIni',
		headerName: plugins.lang.t(BatchTranslation['unRealizedSTGainsIni']).toString(),
		formatter: getNumberCellRenderParams('unRealizedSTGainsIni'),
		editable: false,
		sortable: true,
		hide: true,
		flex: 1
	}),
	_NumberColumn.create({
		colId: 'unRealizedSTGains',
		field: 'analytics.unRealizedSTGains',
		headerName: plugins.lang.t(BatchTranslation['unRealizedSTGains']).toString(),
		formatter: getNumberCellRenderParams('unRealizedSTGains'),
		editable: false,
		sortable: true,
		hide: true,
		flex: 1
	}),
	_NumberColumn.create({
		colId: 'unRealizedLTGainsIni',
		field: 'analytics.unRealizedLTGainsIni',
		headerName: plugins.lang.t(BatchTranslation['unRealizedLTGainsIni']).toString(),
		formatter: getNumberCellRenderParams('unRealizedLTGainsIni'),
		editable: false,
		sortable: true,
		hide: true,
		flex: 1
	}),
	_NumberColumn.create({
		colId: 'unRealizedLTGains',
		field: 'analytics.unRealizedLTGains',
		headerName: plugins.lang.t(BatchTranslation['unRealizedLTGains']).toString(),
		formatter: getNumberCellRenderParams('unRealizedLTGains'),
		editable: false,
		sortable: true,
		hide: true,
		flex: 1
	}),
	_NumberColumn.create({
		colId: 'realizedSTGainsYTDIni',
		field: 'analytics.realizedSTGainsYTDIni',
		headerName: plugins.lang.t(BatchTranslation['realizedSTGainsYTDIni']).toString(),
		formatter: getNumberCellRenderParams('realizedSTGainsYTDIni'),
		editable: false,
		sortable: true,
		hide: true,
		flex: 1
	}),
	_NumberColumn.create({
		colId: 'realizedSTGainsYTD',
		field: 'analytics.realizedSTGainsYTD',
		headerName: plugins.lang.t(BatchTranslation['realizedSTGainsYTD']).toString(),
		formatter: getNumberCellRenderParams('realizedSTGainsYTD'),
		editable: false,
		sortable: true,
		hide: true,
		flex: 1
	}),
	_NumberColumn.create({
		colId: 'realizedSTGainsYTDDelta',
		field: 'analytics.realizedSTGainsYTDDelta',
		headerName: plugins.lang.t(BatchTranslation['realizedSTGainsYTDDelta']).toString(),
		formatter: getNumberCellRenderParams('realizedSTGainsYTDDelta'),
		editable: false,
		sortable: true,
		hide: true,
		flex: 1
	}),
	_NumberColumn.create({
		colId: 'realizedSTLossesYTDIni',
		field: 'analytics.realizedSTLossesYTDIni',
		headerName: plugins.lang.t(BatchTranslation['realizedSTLossesYTDIni']).toString(),
		formatter: getNumberCellRenderParams('realizedSTLossesYTDIni'),
		editable: false,
		sortable: true,
		hide: true,
		flex: 1
	}),
	_NumberColumn.create({
		colId: 'realizedSTLossesYTD',
		field: 'analytics.realizedSTLossesYTD',
		headerName: plugins.lang.t(BatchTranslation['realizedSTLossesYTD']).toString(),
		formatter: getNumberCellRenderParams('realizedSTLossesYTD'),
		editable: false,
		sortable: true,
		hide: true,
		flex: 1
	}),
	_NumberColumn.create({
		colId: 'realizedSTLossesYTDDelta',
		field: 'analytics.realizedSTLossesYTDDelta',
		headerName: plugins.lang.t(BatchTranslation['realizedSTLossesYTDDelta']).toString(),
		formatter: getNumberCellRenderParams('realizedSTLossesYTDDelta'),
		editable: false,
		sortable: true,
		hide: true,
		flex: 1
	}),
	//
	_NumberColumn.create({
		colId: 'realizedLTGainsYTDIni',
		field: 'analytics.realizedLTGainsYTDIni',
		headerName: plugins.lang.t(BatchTranslation['realizedLTGainsYTDIni']).toString(),
		formatter: getNumberCellRenderParams('realizedLTGainsYTDIni'),
		editable: false,
		sortable: true,
		hide: true,
		flex: 1
	}),
	_NumberColumn.create({
		colId: 'realizedLTGainsYTD',
		field: 'analytics.realizedLTGainsYTD',
		headerName: plugins.lang.t(BatchTranslation['realizedLTGainsYTD']).toString(),
		formatter: getNumberCellRenderParams('realizedLTGainsYTD'),
		editable: false,
		sortable: true,
		hide: true,
		flex: 1
	}),
	_NumberColumn.create({
		colId: 'realizedLTGainsYTDDelta',
		field: 'analytics.realizedLTGainsYTDDelta',
		headerName: plugins.lang.t(BatchTranslation['realizedLTGainsYTDDelta']).toString(),
		formatter: getNumberCellRenderParams('realizedLTGainsYTDDelta'),
		editable: false,
		sortable: true,
		hide: true,
		flex: 1
	}),
	_NumberColumn.create({
		colId: 'realizedLTLossesYTDIni',
		field: 'analytics.realizedLTLossesYTDIni',
		headerName: plugins.lang.t(BatchTranslation['realizedLTLossesYTDIni']).toString(),
		formatter: getNumberCellRenderParams('realizedLTLossesYTDIni'),
		editable: false,
		sortable: true,
		hide: true,
		flex: 1
	}),
	_NumberColumn.create({
		colId: 'realizedLTLossesYTD',
		field: 'analytics.realizedLTLossesYTD',
		headerName: plugins.lang.t(BatchTranslation['realizedLTLossesYTD']).toString(),
		formatter: getNumberCellRenderParams('realizedLTLossesYTD'),
		editable: false,
		sortable: true,
		hide: true,
		flex: 1
	}),
	_NumberColumn.create({
		colId: 'realizedLTLossesYTDDelta',
		field: 'analytics.realizedLTLossesYTDDelta',
		headerName: plugins.lang.t(BatchTranslation['realizedLTLossesYTDDelta']).toString(),
		formatter: getNumberCellRenderParams('realizedLTLossesYTDDelta'),
		editable: false,
		sortable: true,
		hide: true,
		flex: 1
	}),
	_DateColumn.create({
		colId: 'lastTrade',
		field: 'lastTrade',
		headerName: plugins.lang.t('BATCH_RESULTS.LAST_TRADE').toString(),
		dateCellRenderParams: DateColumn.defaultRenderParams,
		editable: false,
		sortable: true,
		hide: true,
		flex: 1
	})
]);

type MaybeStringnable = string | number | null | undefined;
function sanitizeValue(value: MaybeStringnable): string {
	if (value === null || typeof value === 'undefined') {
		return '';
	} else {
		return value.toString();
	}
}

function sanitizeCsvValue(value: MaybeStringnable): string {
	if (typeof value === 'string' && /[,"]/.test(value)) {
		return `"${value.replace(/"/g, '""')}"`;
	} else {
		return sanitizeValue(value);
	}
}

const { getter: healthScoreColumnGetter } = GridHelpers.parseGetterSetter<number | null>('analytics.healthScore');
function healthScoreColumnValueGetter(params: ValueGetterParams<WealthExtendedBatchOptimizationEntryOutputRO> | CellToStringParams<WealthExtendedBatchOptimizationEntryOutputRO>): string | number | null {
	if (!params.node) {
		return null;
	}
	if (params.node.group) {
		return GridHelpers.getGroupData(params);
	}
	const result = healthScoreColumnGetter(params.node);
	if (!isNaN(result as number) || params.node.data.status === 'SolutionFound' || params.node.data.status === 'RelaxedSolutionFound') {
		if (result) {
			return result;
		} else {
			return '';
		}
	} else if (params.node.data.status === 'NoSolutionFound' || params.node.data.status === 'BaseProblemHasNoSolution') {
		return plugins.lang.t('BATCH_RESULTS.NO_SOLUTION').toString();
	} else {
		return plugins.lang.t('BATCH_RESULTS.NO_REBALANCING').toString();
	}
}

const { getter: healthScoreDriverColumnGetter } = GridHelpers.parseGetterSetter<string>('analytics.maxSubscoreName');
function healthScoreDriverColumnValueGetter(params: ValueGetterParams<WealthExtendedBatchOptimizationEntryOutputRO> | CellToStringParams<WealthExtendedBatchOptimizationEntryOutputRO>): string {
	if (!params.node) {
		return '';
	}
	if (params.node.group) {
		return GridHelpers.getGroupData(params);
	}
	const result = healthScoreDriverColumnGetter(params.node);
	if (result) {
		return result;
	} else {
		return '';
	}
}

function getNewAccoountBadgeColor(value: ICellRendererParams<WealthExtendedBatchOptimizationEntryOutputRO>): BadgeColor {
	const check = value.data.newAccount;
	if (check) {
		return 'info';
	} else {
		return 'no-style';
	}
}

export function createHandleOptions(context: Context, savedColumns: ColumnStateDTO[]): HandleOptions<WealthExtendedBatchOptimizationEntryOutputRO>[] {
	_columns.length = 0;
	gridColumns(context);
	type ColId = string;
	if ((savedColumns ?? []).length > 0) {
		const _map = _columns.reduce((accu, curr) => {
			accu[curr.colId as string] = curr;
			return accu;
		}, {} as Record<ColId, P>);
		const visibleColumns = savedColumns.filter(c => !c.hide).map(c => {
			const col = _map[c.colId as string];
			col.hide = false;
			col.width = c.width;
			return col;
		});
		const invisibleColumns = savedColumns.filter(c => c.hide).map(c => {
			const col = _map[c.colId as string];
			col.hide = true;
			col.width = c.width;
			return col;
		});
		const actualColumns = [...visibleColumns, ...invisibleColumns];
		const m = {} as Record<ColId, number>;
		actualColumns.forEach((c, i) => {
			m[c.colId as string] = i;
		});
		_columns.sort((a, b) => m[a.colId as ColId] - m[b.colId as ColId]);
	}
	return _columns.map(c => {
		switch (c._type) {
			case TextColumn:
				return TextColumn.create(c as Parameters<typeof TextColumn.create<WealthExtendedBatchOptimizationEntryOutputRO>>[0]);
			case NumberColumn:
				return NumberColumn.create(c as Parameters<typeof NumberColumn.create<WealthExtendedBatchOptimizationEntryOutputRO>>[0]);
			case BadgeTextColumn:
				return BadgeTextColumn.create(c as Parameters<typeof BadgeTextColumn.create<WealthExtendedBatchOptimizationEntryOutputRO>>[0]);
			case WealthLensColumn:
				return WealthLensColumn.create(c as Parameters<typeof WealthLensColumn.create<WealthExtendedBatchOptimizationEntryOutputRO>>[0]);
			case DateColumn:
				return DateColumn.create(c as Parameters<typeof DateColumn.create<WealthExtendedBatchOptimizationEntryOutputRO>>[0]);
			case HtmlColumn:
				return HtmlColumn.create(c as unknown as Parameters<typeof HtmlColumn.create<WealthExtendedBatchOptimizationEntryOutputRO>>[0]);
			default:
				throw new Error('missing type');
		}
	});
}