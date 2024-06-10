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
import { ConstraintSelectionRO } from './constraintSelectionRO';
import { Link } from './link';

export interface ConstraintRO { 
    identity?: string;
    type?: string;
    properties?: { [key: string]: any; };
    selection?: Array<ConstraintSelectionRO>;
    links?: Array<Link>;
}