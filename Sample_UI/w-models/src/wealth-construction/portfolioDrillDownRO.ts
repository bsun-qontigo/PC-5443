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
import { AssetAnalyticsRO } from './assetAnalyticsRO';
import { ClassificationMappingRO } from './classificationMappingRO';
import { InitialvsFinalAnalyticsRO } from './initialvsFinalAnalyticsRO';
import { TradeAnalyticsRO } from './tradeAnalyticsRO';

export interface PortfolioDrillDownRO { 
    /**
     * Identity of the account
     */
    identity?: string;
    /**
     * Date
     */
    date?: string;
    /**
     * Reference value of the initial accunt
     */
    initialReferenceSize?: number;
    /**
     * Reference value of the rebalancing solution
     */
    finalReferenceSize?: number;
    /**
     * Rebalancing defaults risk model
     */
    riskModelName?: string;
    /**
     * Rebalancing defaults benchmark
     */
    benchmarkName?: string;
    /**
     * identity of the strategy
     */
    strategyName?: string;
    /**
     * Classification used to compute sector allocations
     */
    classification?: string;
    /**
     * Initial portfolio drilldown
     */
    assetDetailsInitial?: Array<AssetAnalyticsRO>;
    /**
     * Final portfolio drilldown
     */
    assetDetailsFinal?: Array<AssetAnalyticsRO>;
    /**
     * Initial vs Final portfolio drilldown
     */
    assetDetailsInitialvsFinal?: Array<InitialvsFinalAnalyticsRO>;
    /**
     * Trade analytics
     */
    tradeDetails?: Array<TradeAnalyticsRO>;
    /**
     * Sector allocaton of the initial portfolio
     */
    sectorAllocationInitial?: { [key: string]: number; };
    /**
     * Sector allocaton of the final portfolio
     */
    sectorAllocationFinal?: { [key: string]: number; };
    /**
     * Sector active allocaton of the initial portfolio
     */
    sectorActiveAllocationInitial?: { [key: string]: number; };
    /**
     * Sector active allocaton of the final portfolio
     */
    sectorActiveAllocationFinal?: { [key: string]: number; };
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
    assetClassificationMap?: ClassificationMappingRO;
}