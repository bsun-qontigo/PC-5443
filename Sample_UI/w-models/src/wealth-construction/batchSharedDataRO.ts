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
import { AssetSetRO } from './assetSetRO';
import { ContentBuilderGroupRO } from './contentBuilderGroupRO';
import { ContentBuilderScalarRO } from './contentBuilderScalarRO';
import { CostModelRO } from './costModelRO';
import { GroupRO } from './groupRO';
import { MetagroupRO } from './metagroupRO';
import { MetagroupSchemeRO } from './metagroupSchemeRO';
import { ScalarGroupingRO } from './scalarGroupingRO';
import { StrategyRO } from './strategyRO';

export interface BatchSharedDataRO { 
    baseCurrencyCode?: string;
    assetMapName?: string;
    riskModelNames?: Array<string>;
    groups?: Array<GroupRO>;
    benchmarkNames?: Array<string>;
    metagroups?: Array<MetagroupRO>;
    metagroupSchemes?: Array<MetagroupSchemeRO>;
    contentBuilderGroups?: Array<ContentBuilderGroupRO>;
    contentBuilderScalars?: Array<ContentBuilderScalarRO>;
    scalarGroupings?: Array<ScalarGroupingRO>;
    costModels?: Array<CostModelRO>;
    assetSets?: Array<AssetSetRO>;
    strategy?: StrategyRO;
}