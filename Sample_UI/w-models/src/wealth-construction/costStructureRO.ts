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
import { ActionEntryRO } from './actionEntryRO';
import { Link } from './link';

export interface CostStructureRO { 
    identity?: string;
    description?: string;
    entries?: Array<ActionEntryRO>;
    buySlopes?: { [key: string]: number; };
    sellSlopes?: { [key: string]: number; };
    links?: Array<Link>;
}