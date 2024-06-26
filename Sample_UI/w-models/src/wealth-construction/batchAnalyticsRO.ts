/**
 * axioma-portfolio-wealth-core
 * Portfolio Construction and Wealth Core
 *
 * OpenAPI spec version: @@version.txt
 * Contact: support@axioma.com
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
import { TaxGainLossInfoRO } from './taxGainLossInfoRO';

/**
 * Analytics on the Portfolio
 */
export interface BatchAnalyticsRO { 
    /**
     * Initial Portfolio Market Value
     */
    marketValueIni?: number;
    /**
     * Final Portfolio Market Value
     */
    marketValue?: number;
    /**
     * Initial Portfolio Number of Holdings
     */
    namesIni?: number;
    /**
     * Initial Portfolio Cash percent
     */
    numeraireCashPctIni?: number;
    /**
     * Initial Portfolio Beta
     */
    betaIni?: number;
    /**
     * Final Portfolio Beta
     */
    beta?: number;
    /**
     * BetaDelta
     */
    betaDelta?: number;
    /**
     * Initial Portfolio Active Beta
     */
    activeBetaIni?: number;
    /**
     * Final Portfolio Active Beta
     */
    activeBeta?: number;
    /**
     * ActiveBetaDelta
     */
    activeBetaDelta?: number;
    /**
     * TrackingError
     */
    trackingError?: number;
    /**
     * TrackingErrorDelta
     */
    trackingErrorDelta?: number;
    /**
     * RealizedGainsYTD
     */
    realizedGainsYTD?: number;
    /**
     * RealizedNetGainsDelta
     */
    realizedNetGainsDelta?: number;
    /**
     * Initial Portfolio UnRealizedLossAvailable percent
     */
    unRealizedLossAvailablePctIni?: number;
    /**
     * UnRealizedLossAvailable
     */
    unRealizedLossAvailable?: number;
    /**
     * Initial Portfolio Short Term UnRealizedLossAvailable
     */
    unRealizedSTLossAvailableIni?: number;
    /**
     * Final Short Term UnRealizedLossAvailable
     */
    unRealizedSTLossAvailable?: number;
    /**
     * Initial Portfolio Short Term UnRealizedGains
     */
    unRealizedSTGainsIni?: number;
    /**
     * Final Portfolio Short Term UnRealizedGains
     */
    unRealizedSTGains?: number;
    /**
     * Initial Portfolio Long Term UnRealizedLossAvailable
     */
    unRealizedLTLossAvailableIni?: number;
    /**
     * Final Portfolio Long Term UnRealizedLossAvailable
     */
    unRealizedLTLossAvailable?: number;
    /**
     * Initial Portfolio Long Term UnRealizedGains
     */
    unRealizedLTGainsIni?: number;
    /**
     * Final Portfolio Long Term UnRealizedGains
     */
    unRealizedLTGains?: number;
    /**
     * DeltaNetTaxLossOverTrackingErrorDelta
     */
    deltaNetTaxLossOverTrackingErrorDelta?: number;
    /**
     * NetTaxLossOverTurnoverDelta
     */
    netTaxLossOverTurnoverDelta?: number;
    /**
     * Health Score
     */
    healthScore?: number;
    /**
     * Health Score Max Subscore Name
     */
    maxSubscoreName?: string;
    /**
     * Health Score Subscores
     */
    subscores?: { [key: string]: number; };
    /**
     * Final Portfolio Numeraire Cash
     */
    numeraireCash?: number;
    /**
     * Initial Portfolio Numeraire Cash
     */
    numeraireCashIni?: number;
    /**
     * NumeraireCashDelta
     */
    numeraireCashDelta?: number;
    /**
     * Turnover
     */
    turnoverPercent?: number;
    /**
     * Initial Portfolio Tax Liability
     */
    taxLiabilityIni?: number;
    /**
     * Final Portfolio Tax Liability
     */
    taxLiability?: number;
    unRealizedTaxGainLossInfo?: TaxGainLossInfoRO;
    realizedTaxGainLossInfo?: TaxGainLossInfoRO;
    /**
     * Realized Gains YTD Percent
     */
    realizedGainsYTDPercent?: number;
    /**
     * Realized Net Gains Delta Percent
     */
    realizedNetGainsDeltaPercent?: number;
    /**
     * Unrealized loss available percent
     */
    unRealizedLossAvailablePercent?: number;
    /**
     * Initial Portfolio Net Realized Short Term G/L
     */
    realizedNetSTGLIni?: number;
    /**
     * Initial Portfolio Realized Short Term Gains YTD
     */
    realizedSTGainsYTDIni?: number;
    /**
     * Final Portfolio Realized Short Term Gains YTD
     */
    realizedSTGainsYTD?: number;
    /**
     * RealizedSTGainsYTDDelta
     */
    realizedSTGainsYTDDelta?: number;
    /**
     * Initial Portfolio Realized Short Term Losses YTD
     */
    realizedSTLossesYTDIni?: number;
    /**
     * Final Portfolio Realized Short Term Losses YTD
     */
    realizedSTLossesYTD?: number;
    /**
     * RealizedSTGainsYTDDelta
     */
    realizedSTLossesYTDDelta?: number;
    /**
     * Initial Portfolio Realized Long Term Gains YTD
     */
    realizedLTGainsYTDIni?: number;
    /**
     * Final Portfolio Realized Long Term Gains YTD
     */
    realizedLTGainsYTD?: number;
    /**
     * RealizedSTGainsYTDDelta
     */
    realizedLTGainsYTDDelta?: number;
    /**
     * Initial Portfolio Realized Long Term Losses YTD
     */
    realizedLTLossesYTDIni?: number;
    /**
     * Final Portfolio Realized Long Term Losses YTD
     */
    realizedLTLossesYTD?: number;
    /**
     * RealizedSTGainsYTDDelta
     */
    realizedLTLossesYTDDelta?: number;
}