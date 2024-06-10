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
import { BatchWorkspaceArchiveFileTaskStatusROCancelled } from './batchWorkspaceArchiveFileTaskStatusROCancelled';
import { LogRO } from './logRO';

export interface BatchWorkspaceArchiveFileTaskStatusRO { 
    /**
     * client Id. This is required to figure the blob path.
     */
    clientId?: string;
    /**
     * User Id.
     */
    userId?: string;
    /**
     * Workspace archive request Id. It's a unique GUID.
     */
    requestId?: string;
    /**
     * Strategy name.
     */
    strategyName?: string;
    /**
     * Total number of workspace files to be included in the zip file.
     */
    totalFilesToBeInZip?: number;
    /**
     * Total files processed and added to zip file so far.
     */
    filesProcessed?: number;
    /**
     * Overall status.
     */
    status?: string;
    /**
     * Zip file link to blob in azure storage.
     */
    zipFileBlobLink?: string;
    logs?: LogRO;
    cancelled?: BatchWorkspaceArchiveFileTaskStatusROCancelled;
    /**
     * StartTime time of the download request.
     */
    startTime?: Date;
    /**
     * End time of the archive file processing for the download request.
     */
    endTime?: Date;
}