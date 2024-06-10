import { UnreachableError } from '@axioma/core';
import { BatchAnalyticsRO, BatchOptimizationEntryOutputRO } from '@axioma/wealth-models';

export const enum Unit {
	NUMBER,
	INTEGER,
	PERCENT,
	BPS,
	CURRENCY
}

export type SupportedUnitAnalytics = keyof Omit<BatchAnalyticsRO, 'maxSubscoreName' | 'subscores' | 'unRealizedTaxGainLossInfo' | 'realizedTaxGainLossInfo'> | keyof Pick<BatchOptimizationEntryOutputRO, 'cashFlow'>;
const analyticsUnitMap: Record<SupportedUnitAnalytics, Unit> = {
	/** NUMBER */
	'deltaNetTaxLossOverTrackingErrorDelta': Unit.NUMBER,
	'healthScore': Unit.NUMBER,
	'netTaxLossOverTurnoverDelta': Unit.NUMBER,
	'realizedGainsYTD': Unit.NUMBER,
	'realizedNetGainsDelta': Unit.NUMBER,
	'unRealizedLossAvailable': Unit.NUMBER,
	'betaIni': Unit.NUMBER,
	'beta': Unit.NUMBER,
	'betaDelta': Unit.NUMBER,
	'activeBetaIni': Unit.NUMBER,
	'activeBeta': Unit.NUMBER,
	'activeBetaDelta': Unit.NUMBER,
	/** INTEGER */
	'namesIni': Unit.INTEGER,
	/** CURRENCY */
	'marketValue': Unit.CURRENCY,
	'marketValueIni': Unit.CURRENCY,
	'numeraireCashIni': Unit.CURRENCY,
	'numeraireCash': Unit.CURRENCY,
	'numeraireCashDelta': Unit.CURRENCY,
	'unRealizedSTLossAvailableIni': Unit.CURRENCY,
	'unRealizedSTLossAvailable': Unit.CURRENCY,
	'unRealizedLTLossAvailableIni': Unit.CURRENCY,
	'unRealizedLTLossAvailable': Unit.CURRENCY,
	'taxLiabilityIni': Unit.CURRENCY,
	'taxLiability': Unit.CURRENCY,
	'realizedNetSTGLIni': Unit.CURRENCY,
	'cashFlow': Unit.CURRENCY,
	'unRealizedSTGainsIni': Unit.CURRENCY,
	'unRealizedSTGains': Unit.CURRENCY,
	'unRealizedLTGainsIni': Unit.CURRENCY,
	'unRealizedLTGains': Unit.CURRENCY,
	'realizedSTGainsYTDIni': Unit.CURRENCY,
	'realizedSTGainsYTD': Unit.CURRENCY,
	'realizedSTGainsYTDDelta': Unit.CURRENCY,
	'realizedSTLossesYTDIni': Unit.CURRENCY,
	'realizedSTLossesYTD': Unit.CURRENCY,
	'realizedSTLossesYTDDelta': Unit.CURRENCY,
	'realizedLTGainsYTDIni': Unit.CURRENCY,
	'realizedLTGainsYTD': Unit.CURRENCY,
	'realizedLTGainsYTDDelta': Unit.CURRENCY,
	'realizedLTLossesYTDIni': Unit.CURRENCY,
	'realizedLTLossesYTD': Unit.CURRENCY,
	'realizedLTLossesYTDDelta': Unit.CURRENCY,
	/** PERCENT */
	'trackingError': Unit.PERCENT,
	'trackingErrorDelta': Unit.PERCENT,
	'realizedGainsYTDPercent': Unit.PERCENT,
	'realizedNetGainsDeltaPercent': Unit.PERCENT,
	'unRealizedLossAvailablePercent': Unit.PERCENT,
	'turnoverPercent': Unit.PERCENT,
	'numeraireCashPctIni': Unit.PERCENT,
	'unRealizedLossAvailablePctIni': Unit.PERCENT,
} as const;

export function getUnitFromAnalytics(analytics: SupportedUnitAnalytics): Unit {
	const unit = analyticsUnitMap[analytics];
	if (typeof unit === 'undefined' && !IsProd) {
		throw new UnreachableError(`unsupported analytics: ${analytics}`);
	}
	return unit;
}

export function createNumberFormat(culture: string, digit: number, nt: Intl.NumberFormatOptions['notation'] = 'standard'): Intl.NumberFormat {
	return new Intl.NumberFormat(culture, {
		style: 'decimal',
		minimumFractionDigits: digit,
		maximumFractionDigits: digit,
		notation: nt
	});
}

export function createPercentFormat(culture: string, digit: number): Intl.NumberFormat {
	return new Intl.NumberFormat(culture, {
		style: 'percent',
		minimumFractionDigits: digit,
		maximumFractionDigits: digit
	});
}