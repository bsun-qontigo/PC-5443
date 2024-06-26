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
import { HoldingLotAnalyticsRO } from './holdingLotAnalyticsRO';

/**
 * Final portfolio drilldown
 */
export interface AssetAnalyticsRO { 
    /**
     * Identity of the asset
     */
    assetId?: string;
    /**
     * Description of the asset
     */
    description?: string;
    /**
     * Price of the asset
     */
    price?: number;
    /**
     * Shares
     */
    shares?: number;
    /**
     * Value of the asset in currency
     */
    value?: number;
    /**
     * Unrealized gain/loss of the asset
     */
    unRealizedGainLoss?: number;
    /**
     * Weight of the asset in the portfolio in unit Percent
     */
    weightPct?: number;
    /**
     * Active weight of the asset in the portfolio in unit Percent
     */
    activeWeightPct?: number;
    /**
     * Active value of the asset in currency
     */
    activeValue?: number;
    /**
     * HoldingLot anlytics
     */
    holdingLotAnalytics?: Array<HoldingLotAnalyticsRO>;
}