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
import { CostStructureRO } from './costStructureRO';
import { Link } from './link';

export interface CostModelRO { 
    identity?: string;
    description?: string;
    date?: string;
    unit?: string;
    costStructures?: Array<CostStructureRO>;
    links?: Array<Link>;
}