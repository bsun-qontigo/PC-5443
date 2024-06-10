import type { HandleOptions, RowNode, ExportMode, CellToStringParams, ColDef } from '@axioma-types/grid-wrapper';
import { TextColumn, NumberColumn, DateColumn } from '@axioma-framework/grid-wrapper';
import { plugins } from '@axioma/common';
import { userApplicationStateClientRegistry } from '@axioma-api/wealth-user-application-state';
import { ClassificationDTO, GroupByKey, Nullable, WealthAssetAnalyticsRO, WealthHoldingLotAnalyticsRO, WealthInitialvsFinalAnalyticsRO, WealthTradeAnalyticsRO, WealthTransactionLotAnalyticsRO } from '@axioma/wealth-types';
import { Unclassified } from '@axioma/wealth-commons';
import { sanitizeCsvValue } from '@axioma/core';
import { Context, WealthAssetTypeAnalyticsRO } from './type';
import { exportCellValueGetterForGroupingColumn, isGroupingColumn } from './downloaders/helper';
import { getLevelDepth, getLevelName } from '@axioma-api/wealth-drilldown';

export const lotsGridColumns = (): HandleOptions<WealthHoldingLotAnalyticsRO>[] => ([
    TextColumn.create({
        colId: 'assetId',
        field: 'assetId',
        headerName: plugins.lang.t('PORTFOLIO_TABLE.ASSET_ID').toString(),
        editable: false,
        flex: 1,
        cellClass: 'stringType'
    }),
    TextColumn.create({
        colId: 'lotId',
        field: 'lotId',
        headerName: plugins.lang.t('PORTFOLIO_TABLE.LOT_ID').toString(),
        editable: false,
        flex: 1,
        cellClass: 'stringType'
    }),
    TextColumn.create({
        colId: 'description',
        field: 'description',
        headerName: plugins.lang.t('PORTFOLIO_TABLE.DESCRIIPTION').toString(),
        editable: false,
        flex: 1,
    }),
    NumberColumn.create({
        colId: 'shares',
        field: 'shares',
        formatter: userApplicationStateClientRegistry.getFormatter('decimal'),
        headerName: plugins.lang.t('PORTFOLIO_TABLE.SHARES').toString(),
        editable: false,
        sortable: true,
        flex: 1
    }),
    DateColumn.create({
        colId: 'buyDate',
        field: 'buyDate',
        headerName: plugins.lang.t('PORTFOLIO_TABLE.BUY_DATE').toString(),
        dateCellRenderParams: DateColumn.defaultRenderParams,
        editable: false,
        flex: 1
    }),
    NumberColumn.create({
        colId: 'buyPrice',
        field: 'buyPrice',
        formatter: userApplicationStateClientRegistry.getFormatter('currency'),
        headerName: plugins.lang.t('PORTFOLIO_TABLE.BUY_PRICE').toString(),
        editable: false,
        sortable: true,
        flex: 1
    }),

    NumberColumn.create({
        colId: 'costBasis',
        field: 'costBasis',
        formatter: userApplicationStateClientRegistry.getFormatter('currency'),
        headerName: plugins.lang.t('PORTFOLIO_TABLE.COST_BASIS').toString(),
        editable: false,
        sortable: true,
        flex: 1
    }),
    NumberColumn.create({
        colId: 'unRealizedGainLoss',
        field: 'unRealizedGainLoss',
        formatter: userApplicationStateClientRegistry.getFormatter('currency'),
        headerName: plugins.lang.t('PORTFOLIO_TABLE.UNREALIZED_GAIN_LOSS').toString(),
        editable: false,
        sortable: true,
        flex: 1
    }),
    NumberColumn.create({
        colId: 'price',
        field: 'price',
        formatter: userApplicationStateClientRegistry.getFormatter('currency'),
        headerName: plugins.lang.t('PORTFOLIO_TABLE.PRICE').toString(),
        editable: false,
        sortable: true,
        flex: 1
    }),
    NumberColumn.create({
        colId: 'value',
        field: 'value',
        formatter: userApplicationStateClientRegistry.getFormatter('currency'),
        headerName: plugins.lang.t('PORTFOLIO_TABLE.VALUE').toString(),
        editable: false,
        sortable: true,
        flex: 1
    }),
    TextColumn.create({
        colId: 'term',
        field: {
            getter: termGetter
        },
        headerName: plugins.lang.t('PORTFOLIO_TABLE.TERM').toString(),
        editable: false,
        flex: 1,
    }),
]);

export const gridColumns = (): HandleOptions<WealthAssetAnalyticsRO>[] => ([
    TextColumn.create({
        colId: 'assetId',
        field: 'assetId',
        headerName: plugins.lang.t('PORTFOLIO_TABLE.ASSET_ID').toString(),
        editable: false,
        flex: 1,
        hide: true
    }),
    TextColumn.create({
        colId: 'description',
        field: 'description',
        headerName: plugins.lang.t('PORTFOLIO_TABLE.DESCRIIPTION').toString(),
        editable: false,
        flex: 1,
        aggFunc: () => ''
    }),
    NumberColumn.create({
        colId: 'price',
        field: 'price',
        formatter: userApplicationStateClientRegistry.getFormatter('currency'),
        headerName: plugins.lang.t('PORTFOLIO_TABLE.PRICE').toString(),
        editable: false,
        sortable: true,
        flex: 1
    }),
    NumberColumn.create({
        colId: 'shares',
        field: 'shares',
        formatter: userApplicationStateClientRegistry.getFormatter('decimal'),
        headerName: plugins.lang.t('PORTFOLIO_TABLE.SHARES').toString(),
        editable: false,
        sortable: true,
        flex: 1
    }),
    NumberColumn.create({
        colId: 'value',
        field: 'value',
        formatter: userApplicationStateClientRegistry.getFormatter('currency'),
        headerName: plugins.lang.t('PORTFOLIO_TABLE.VALUE').toString(),
        editable: false,
        sortable: true,
        flex: 1,
        aggFunc: 'sum'
    }),
    NumberColumn.create({
        colId: 'weightPct',
        field: 'weightPct',
        formatter: userApplicationStateClientRegistry.getFormatter('percent'),
        headerName: plugins.lang.t('PORTFOLIO_TABLE.WEIGHT').toString(),
        editable: false,
        sortable: true,
        flex: 1,
        aggFunc: 'sum'
    }),
    NumberColumn.create({
        colId: 'unRealizedGainLoss',
        field: 'unRealizedGainLoss',
        formatter: userApplicationStateClientRegistry.getFormatter('currency'),
        headerName: plugins.lang.t('PORTFOLIO_TABLE.UNREALIZED_GAIN_LOSS').toString(),
        editable: false,
        sortable: true,
        flex: 1,
        aggFunc: 'sum'
    }),
    NumberColumn.create({
        colId: 'activeWeightPct',
        field: 'activeWeightPct',
        formatter: userApplicationStateClientRegistry.getFormatter('percent'),
        headerName: plugins.lang.t('PORTFOLIO_TABLE.ACTIVE_WEIGHT').toString(),
        editable: false,
        sortable: true,
        flex: 1
    }),
    NumberColumn.create({
        colId: 'activeValue',
        field: 'activeValue',
        formatter: userApplicationStateClientRegistry.getFormatter('currency'),
        headerName: plugins.lang.t('PORTFOLIO_TABLE.ACTIVE_VALUE').toString(),
        editable: false,
        sortable: true,
        flex: 1
    })
]);

export const tradeListColumns = (): HandleOptions<WealthTradeAnalyticsRO>[] => ([
    TextColumn.create({
        colId: 'assetId',
        field: 'assetId',
        headerName: plugins.lang.t('PORTFOLIO_TABLE.ASSET_ID').toString(),
        editable: false,
        flex: 1,
    }),
    TextColumn.create({
        colId: 'description',
        field: 'description',
        headerName: plugins.lang.t('PORTFOLIO_TABLE.DESCRIIPTION').toString(),
        editable: false,
        flex: 1,
    }),
    NumberColumn.create({
        colId: 'shares',
        field: 'shares',
        formatter: userApplicationStateClientRegistry.getFormatter('decimal'),
        headerName: plugins.lang.t('PORTFOLIO_TABLE.SHARES').toString(),
        editable: false,
        sortable: true,
        flex: 1
    }),
    NumberColumn.create({
        colId: 'price',
        field: 'price',
        formatter: userApplicationStateClientRegistry.getFormatter('currency'),
        headerName: plugins.lang.t('PORTFOLIO_TABLE.PRICE').toString(),
        editable: false,
        sortable: true,
        flex: 1
    }),
    NumberColumn.create({
        colId: 'tradedValue',
        field: 'tradedValue',
        formatter: userApplicationStateClientRegistry.getFormatter('decimal'),
        headerName: plugins.lang.t('PORTFOLIO_TABLE.TRADED_VALUE').toString(),
        editable: false,
        sortable: true,
        flex: 1
    }),
    NumberColumn.create({
        colId: 'tradedValuePercent',
        field: 'tradedValuePercent',
        formatter: userApplicationStateClientRegistry.getFormatter('percent'),
        headerName: plugins.lang.t('PORTFOLIO_TABLE.TRADED_VALUE_PERCENT').toString(),
        editable: false,
        sortable: true,
        flex: 1
    }),
    NumberColumn.create({
        colId: 'realizedGainLoss',
        field: 'realizedGainLoss',
        formatter: userApplicationStateClientRegistry.getFormatter('decimal'),
        headerName: plugins.lang.t('PORTFOLIO_TABLE.REALIZED_GAIN_LOSS').toString(),
        editable: false,
        sortable: true,
        flex: 1
    }),
    TextColumn.create({
        colId: 'tradeType',
        field: 'tradeType',
        headerName: plugins.lang.t('PORTFOLIO_TABLE.TRADE_TYPE').toString(),
        editable: false,
        flex: 1,
    }),
    TextColumn.create({
        colId: 'detailedTradeType',
        field: 'detailedTradeType',
        headerName: plugins.lang.t('PORTFOLIO_TABLE.DETAILED_TRADE_TYPE').toString(),
        editable: false,
        flex: 1,
    }),
    TextColumn.create({
        colId: 'term',
        field: {
            getter: termGetter
        },
        headerName: plugins.lang.t('PORTFOLIO_TABLE.TERM').toString(),
        editable: false,
        flex: 1,
    }),
]);

export const tradeListLotsColumns = (): HandleOptions<WealthTransactionLotAnalyticsRO>[] => ([
    TextColumn.create({
        colId: 'assetId',
        field: 'assetId',
        headerName: plugins.lang.t('PORTFOLIO_TABLE.ASSET_ID').toString(),
        editable: false,
        flex: 1,
        cellClass: 'stringType'
    }),
    TextColumn.create({
        colId: 'lotId',
        field: 'lotId',
        headerName: plugins.lang.t('PORTFOLIO_TABLE.LOT_ID').toString(),
        editable: false,
        flex: 1,
        cellClass: 'stringType'
    }),
    TextColumn.create({
        colId: 'description',
        field: 'description',
        headerName: plugins.lang.t('PORTFOLIO_TABLE.DESCRIIPTION').toString(),
        editable: false,
        flex: 1,
    }),
    DateColumn.create({
        colId: 'buyDate',
        field: 'buyDate',
        headerName: plugins.lang.t('PORTFOLIO_TABLE.BUY_DATE').toString(),
        dateCellRenderParams: DateColumn.defaultRenderParams,
        editable: false,
        flex: 1
    }),
    NumberColumn.create({
        colId: 'buyPrice',
        field: 'buyPrice',
        formatter: userApplicationStateClientRegistry.getFormatter('currency'),
        headerName: plugins.lang.t('PORTFOLIO_TABLE.BUY_PRICE').toString(),
        editable: false,
        sortable: true,
        flex: 1
    }),
    NumberColumn.create({
        colId: 'shares',
        field: 'shares',
        formatter: userApplicationStateClientRegistry.getFormatter('decimal'),
        headerName: plugins.lang.t('PORTFOLIO_TABLE.SHARES').toString(),
        editable: false,
        sortable: true,
        flex: 1
    }),
    NumberColumn.create({
        colId: 'costBasis',
        field: 'costBasis',
        formatter: userApplicationStateClientRegistry.getFormatter('currency'),
        headerName: plugins.lang.t('PORTFOLIO_TABLE.COST_BASIS').toString(),
        editable: false,
        sortable: true,
        flex: 1
    }),
    NumberColumn.create({
        colId: 'realizedGainLoss',
        field: 'realizedGainLoss',
        formatter: userApplicationStateClientRegistry.getFormatter('currency'),
        headerName: plugins.lang.t('PORTFOLIO_TABLE.REALIZED_GAIN_LOSS').toString(),
        editable: false,
        sortable: true,
        flex: 1
    }),
    NumberColumn.create({
        colId: 'price',
        field: 'price',
        formatter: userApplicationStateClientRegistry.getFormatter('currency'),
        headerName: plugins.lang.t('PORTFOLIO_TABLE.PRICE').toString(),
        editable: false,
        sortable: true,
        flex: 1
    }),
    NumberColumn.create({
        colId: 'value',
        field: 'value',
        formatter: userApplicationStateClientRegistry.getFormatter('currency'),
        headerName: plugins.lang.t('PORTFOLIO_TABLE.VALUE').toString(),
        editable: false,
        sortable: true,
        flex: 1
    }),
    TextColumn.create({
        colId: 'tradeType',
        field: 'tradeType',
        headerName: plugins.lang.t('PORTFOLIO_TABLE.TRADE_TYPE').toString(),
        editable: false,
        flex: 1,
    }),
    TextColumn.create({
        colId: 'term',
        field: {
            getter: termGetter
        },
        headerName: plugins.lang.t('PORTFOLIO_TABLE.TERM').toString(),
        editable: false,
        flex: 1,
    }),
]);

export const initialFinalColumns = (): HandleOptions<WealthInitialvsFinalAnalyticsRO>[] => ([
    TextColumn.create({
        colId: 'assetId',
        field: 'assetId',
        headerName: plugins.lang.t('PORTFOLIO_TABLE.ASSET_ID').toString(),
        editable: false,
        flex: 1,
    }),
    TextColumn.create({
        colId: 'description',
        field: 'description',
        headerName: plugins.lang.t('PORTFOLIO_TABLE.DESCRIIPTION').toString(),
        editable: false,
        flex: 1,
    }),
    NumberColumn.create({
        colId: 'price',
        field: 'price',
        formatter: userApplicationStateClientRegistry.getFormatter('currency'),
        headerName: plugins.lang.t('PORTFOLIO_TABLE.PRICE').toString(),
        editable: false,
        sortable: true,
        flex: 1
    }),
    NumberColumn.create({
        colId: 'initialWeightPct',
        field: 'initialWeightPct',
        formatter: userApplicationStateClientRegistry.getFormatter('percent'),
        headerName: plugins.lang.t('PORTFOLIO_TABLE.INITIAL_WEIGHT_PCT').toString(),
        editable: false,
        sortable: true,
        flex: 1,
        aggFunc: 'sum'
    }),
    NumberColumn.create({
        colId: 'finalWeightPct',
        field: 'finalWeightPct',
        formatter: userApplicationStateClientRegistry.getFormatter('percent'),
        headerName: plugins.lang.t('PORTFOLIO_TABLE.FINAL_WEIGHT_PCT').toString(),
        editable: false,
        sortable: true,
        flex: 1,
        aggFunc: 'sum'
    }),
    NumberColumn.create({
        colId: 'initialUnRealizedGainLoss',
        field: 'initialUnRealizedGainLoss',
        formatter: userApplicationStateClientRegistry.getFormatter('currency'),
        headerName: plugins.lang.t('PORTFOLIO_TABLE.INITIAL_UNREALIZED_GAIN_LOSS').toString(),
        editable: false,
        sortable: true,
        flex: 1,
        aggFunc: 'sum'
    }),
    NumberColumn.create({
        colId: 'finalUnRealizedGainLoss',
        field: 'finalUnRealizedGainLoss',
        formatter: userApplicationStateClientRegistry.getFormatter('currency'),
        headerName: plugins.lang.t('PORTFOLIO_TABLE.FINAL_UNREALIZED_GAIN_LOSS').toString(),
        editable: false,
        sortable: true,
        flex: 1,
        aggFunc: 'sum'
    }),
    NumberColumn.create({
        colId: 'realizedGainLoss',
        field: 'realizedGainLoss',
        formatter: userApplicationStateClientRegistry.getFormatter('currency'),
        headerName: plugins.lang.t('PORTFOLIO_TABLE.REALIZED_GAIN_LOSS').toString(),
        editable: false,
        sortable: true,
        flex: 1,
        aggFunc: 'sum'
    }),
]);

export function createAssetColumns(context: Context, baseColumns: HandleOptions<WealthAssetAnalyticsRO>[], groupBy: Nullable<GroupByKey>, classificationDTO: ClassificationDTO): HandleOptions<WealthAssetAnalyticsRO>[];
export function createAssetColumns(context: Context, baseColumns: HandleOptions<WealthInitialvsFinalAnalyticsRO>[], groupBy: Nullable<GroupByKey>, classificationDTO: ClassificationDTO): HandleOptions<WealthInitialvsFinalAnalyticsRO>[];
export function createAssetColumns(context: Context, baseColumns: HandleOptions<WealthAssetAnalyticsRO>[] | HandleOptions<WealthInitialvsFinalAnalyticsRO>[], groupBy: Nullable<GroupByKey>, classificationDTO: ClassificationDTO): HandleOptions<WealthAssetAnalyticsRO>[] | HandleOptions<WealthInitialvsFinalAnalyticsRO>[] {
    if (groupBy !== null) {
        baseColumns.push(...buildClassificationColumns(context, groupBy, classificationDTO));
    }
    return baseColumns;
}

export function prepareColDefForCsvExport(c: ColDef<WealthAssetAnalyticsRO>): void {
    if (isGroupingColumn(c)) {
        c.exportCellValue = (mode: ExportMode, params: CellToStringParams<WealthAssetTypeAnalyticsRO>) => {
            const { node, column, api: gridApi } = params;
            const value = exportCellValueGetterForGroupingColumn(gridApi, column, node as RowNode<unknown>);
            switch (mode) {
                case 'Clipboard':
                    return value;
                case 'Csv':
                    return _sanitizeCsvValue(value);
                case 'Excel':
                    return value;
                default:
                    return '';
            }
        };
    } else {
        // temp fix null exception in Gallery
        type P = NonNullable<typeof c.exportCellValue>;
        type Q = Parameters<P>;
        const exportCellValue = c.exportCellValue as P;
        c.exportCellValue = (...args: Q): string => {
            try {
                return exportCellValue.apply(exportCellValue, args);
            } catch (_: unknown) {
                return '';
            }
        };
    }
}

export function getGroupingHeaderName(isGroupByMode: boolean | null): string | undefined {
    return isGroupByMode ? plugins.lang.t('PORTFOLIO_TABLE.SYMBOL').toString() : plugins.lang.t('PORTFOLIO_TABLE.ASSET_ID').toString();
}

export function toggleAggColumns<T>(isGroupByMode: boolean | null, colDefs: ColDef<T>[], groupByKeys: GroupByKey[]): void {
    if (isGroupByMode) {
        colDefs.filter(c => ['assetId', ...groupByKeys].indexOf(c.colId as string) >= 0).forEach(c => c.hide = true);
    } else {
        colDefs.filter(c => ['assetId'].indexOf(c.colId as string) >= 0).forEach(c => c.hide = false);
        colDefs.filter(c => [...groupByKeys].indexOf(c.colId as GroupByKey) >= 0).forEach(c => c.hide = true);
    }
}

const buildClassificationColumns = (context: Context, groupBy: GroupByKey, classificationDTO: ClassificationDTO): HandleOptions<WealthAssetAnalyticsRO>[] | HandleOptions<WealthInitialvsFinalAnalyticsRO>[] => {
    const depth = classificationDTO.length;
    const currentDepth = getLevelDepth(groupBy);
    const columns = [];
    for (let i = 1; i < currentDepth; i++) {
        const match = classificationDTO.find(c => c.key === getLevelName(i)) as ClassificationDTO[number];
        columns.push(TextColumn.create({
            colId: match.key,
            field: {
                getter(params) {
                    const cellValue = params.data.classifications?.[match.key] as string;
                    const parts = cellValue?.split('.') ?? [];
                    if (parts.length > 1) {
                        return parts[1];
                    } else {
                        return cellValue;
                    }
                }
            },
            headerName: `${match.i18nKey}`,
            editable: false,
            hide: true,
            rowGroup: false,
            resizable: true,
            tooltipValueGetter: (params) => {
                if (params.node?.group) {
                    return [context.riskModel(), params.node.key].join('.');
                } else {
                    return [context.riskModel(), params.value].join('.');
                }
            }
        }) as HandleOptions<WealthAssetAnalyticsRO> | HandleOptions<WealthInitialvsFinalAnalyticsRO>);
    }
    for (let i = currentDepth; i < depth + 1; i++) {
        const match = classificationDTO.find(c => c.key === getLevelName(i)) as ClassificationDTO[number];
        columns.push(TextColumn.create({
            colId: match.key,
            field: {
                getter(params) {
                    const cellValue = params.data.classifications?.[match.key] as string;
                    const parts = cellValue?.split('.') ?? [];
                    if (parts.length > 1) {
                        return parts[1];
                    } else {
                        return cellValue;
                    }
                }
            },
            headerName: `${match.i18nKey}`,
            editable: false,
            hide: true,
            rowGroup: true,
            resizable: true,
            rowGroupIndex: i,
            sortable: true,
            comparator: (a, b, _, __, isInverted) => {
                const m = isInverted ? -1 : 1;
                let r = 0;
                if (a === Unclassified || a === null) {
                    r = 1 * m;
                } else if (b === Unclassified || b === null) {
                    r = (-1) * m;
                } else {
                    r = (String(a ?? '').localeCompare(String(b ?? '')));
                }
                return r;
            },
            tooltipValueGetter: (params) => {
                if (params.node?.group) {
                    return [context.riskModel(), params.node.key].join('.');
                } else {
                    return [context.riskModel(), params.value].join('.');
                }
            }

        }) as HandleOptions<WealthAssetAnalyticsRO> | HandleOptions<WealthInitialvsFinalAnalyticsRO>);
    }
    return columns;
};

const _sanitizeCsvValue = (value: string | number | null) => {
    if (value === null) {
        return '';
    } else {
        return sanitizeCsvValue(value);
    }
};

const termGetter = (node: RowNode<WealthTransactionLotAnalyticsRO>): string => {
    return node.data.term ?? '';
};