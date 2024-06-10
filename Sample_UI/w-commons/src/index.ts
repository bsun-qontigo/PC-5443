import { chartDateRange } from '@axioma-framework/charts';
export * from './batchColumnHelpers';
export * from './unit';
export * from './event';
export * from './decorators';
export * as WealthLensColumn from './wealthLensColumn';
export * from './healthscore';
export * as ExportHelpers from './exportHelpers';
export * as ChartDownloadHelpers from './chartDownloadHelper';

export const GridTypeToggle = ['original', 'tradeList', 'final', 'initialFinal'] as const;
export type GridTypeToggleType = typeof GridTypeToggle[number];

export const ChartDateRangeshort = chartDateRange.slice(0, chartDateRange.length - 2);
export type ChartDateRangeType = typeof ChartDateRangeshort[number];

export const Unclassified = 'Unclassified';
export const scatterChartAxis = ['marketValue', 'trackingError', 'trackingErrorDelta', 'realizedGainsYTD', 'realizedGainsYTDPercent', 'realizedNetGainsDelta', 'realizedNetGainsDeltaPercent', 'unRealizedLossAvailable', 'unRealizedLossAvailablePercent', 'deltaNetTaxLossOverTrackingErrorDelta', 'netTaxLossOverTurnoverDelta', 'numeraireCashIni', 'numeraireCash', 'numeraireCashDelta', 'turnoverPercent', 'cashFlow', 'marketValueIni', 'namesIni', 'numeraireCashPctIni', 'betaIni', 'beta', 'betaDelta', 'activeBetaIni', 'activeBeta', 'activeBetaDelta', 'unRealizedLossAvailablePctIni', 'unRealizedSTLossAvailableIni', 'unRealizedSTLossAvailable', 'unRealizedLTLossAvailableIni', 'unRealizedLTLossAvailable', 'taxLiabilityIni', 'taxLiability', 'realizedNetSTGLIni', 'unRealizedSTGainsIni', 'unRealizedSTGains', 'unRealizedLTGainsIni', 'unRealizedLTGains', 'realizedSTGainsYTDIni', 'realizedSTGainsYTD', 'realizedSTGainsYTDDelta', 'realizedSTLossesYTDIni', 'realizedSTLossesYTD', 'realizedSTLossesYTDDelta', 'realizedLTGainsYTDIni', 'realizedLTGainsYTD', 'realizedLTGainsYTDDelta', 'realizedLTLossesYTDIni', 'realizedLTLossesYTD', 'realizedLTLossesYTDDelta'];
export type BatchAnalyticsROKey = typeof scatterChartAxis[number];
