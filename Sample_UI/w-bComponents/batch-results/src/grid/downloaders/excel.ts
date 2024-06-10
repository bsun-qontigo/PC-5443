import { exportAsExcelSingle } from '@axioma/wealth-services';
import { createSingleExcelDownloadRequest } from './helper';
import { BaseDownloader } from './base';

export class ExcelDownloader extends BaseDownloader {
    public download(): Promise<void> {
        const request = createSingleExcelDownloadRequest(this.context);
        return exportAsExcelSingle(request);
    }
}
