import { exportAsExcelMultiple, exportAsExcelSingle } from '@axioma/wealth-services';
import { BaseDownloader } from './base';
import { Context } from '../type';
import { createMultipleExcelDownloadRequest, createSingleExcelDownloadRequest } from './helper';
import { fsMultipleDownload, fsSingleDownload } from '../../utils/fsEvents';

export class ExcelDownloader extends BaseDownloader {
    public constructor(protected readonly context: Context, private readonly isSingle: boolean) {
        super(context);
    }
    public async download(): Promise<void> {
        if (this.isSingle) {
            fsSingleDownload();
            const request = await createSingleExcelDownloadRequest(this.context);
            return exportAsExcelSingle(request);
        } else {
            fsMultipleDownload();
            const request = await createMultipleExcelDownloadRequest(this.context);
            return exportAsExcelMultiple(request);
        }
    }
}