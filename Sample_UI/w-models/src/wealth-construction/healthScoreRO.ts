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
import { ComplianceDataRO } from './complianceDataRO';
import { HealthDataRO } from './healthDataRO';
import { PortfolioDataRO } from './portfolioDataRO';
import { SelectionDataRO } from './selectionDataRO';

/**
 * Health Score Input
 */
export interface HealthScoreRO { 
    index?: Array<Array<string>>;
    compliance?: ComplianceDataRO;
    portfolioData?: PortfolioDataRO;
    ancillaryStatistics?: HealthDataRO;
    objectiveTerms?: HealthDataRO;
    aggregateConstraints?: HealthDataRO;
    selectionConstraints?: SelectionDataRO;
}