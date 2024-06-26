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

/**
 * Map of asset and its classification
 */
export interface ClassificationMappingRO { 
    /**
     * Levels of the classification
     */
    levels?: Array<string>;
    /**
     * Mapping of assetId and its classification
     */
    mapping?: { [key: string]: Array<string>; };
}