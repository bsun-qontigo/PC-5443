import { exportAsExcelSingle } from '@axioma/wealth-services';
import { createSingleExcelDownloadRequest } from './helper';
import { BaseDownloader } from './base';

export class ExcelDownloader extends BaseDownloader {
    public async download(): Promise<void> {
        const request = await createSingleExcelDownloadRequest(this.context);
        return exportAsExcelSingle(request);
    }
}
