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

export interface BatchWorkspaceArchiveFileEntryRequestRO { 
    /**
     * Portfolio name of the workspace file to be included in the zip file.
     */
    portfolioName?: string;
    /**
     * Workspace id of the portfolio workspace requested to be included in the zip file.
     */
    workspaceId?: string;
}