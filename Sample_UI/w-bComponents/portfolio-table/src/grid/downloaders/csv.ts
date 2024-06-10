import { getColumnKeysForExport } from './helper';
import { BaseDownloader } from './base';
import { fsCSVDownload } from '../../utils/fsEvents';

export class CsvDownloader extends BaseDownloader {

	public override async download(): Promise<void> {
		fsCSVDownload();
		return this.context.gridApi().exportDataAsCsv({
			onlySelected: false,
			fileName: `export${new Date().toUTCString()}.csv`,
			columnKeys: getColumnKeysForExport(this.context),
		});
	}
}

