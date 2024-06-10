import { getColumnKeysForExport } from './helper';
import { BaseDownloader } from './base';
export class CsvDownloader extends BaseDownloader {

	public override download(): void {
		const rowsSelected = this.context.gridApi().getSelectedRows();
		let onlySelected = true;
		if (rowsSelected.length === 0) {
			onlySelected = false;
		}
		return this.context.gridApi().exportDataAsCsv({
			onlySelected,
			fileName: `export${new Date().toUTCString()}.csv`,
			columnKeys: getColumnKeysForExport(this.context)
		});
	}
}

