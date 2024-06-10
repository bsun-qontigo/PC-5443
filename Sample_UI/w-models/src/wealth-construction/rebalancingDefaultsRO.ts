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

export interface RebalancingDefaultsRO { 
    alphasName?: string;
    betasName?: string;
    benchmarkName?: string;
    lotSizes?: string;
    roundLotSize?: number;
    riskModelName?: string;
    transactionCostModelName?: string;
    useCashForRoundLot?: boolean;
    defaultPriceGroup?: string;
}