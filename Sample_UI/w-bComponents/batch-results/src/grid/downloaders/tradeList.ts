import { TradeListExportInitiator } from '../type';
import { BaseDownloader } from './base';

export class TradeListDownloader extends BaseDownloader {

	public override download(): Promise<void> {
		const selectedRows = this.context.gridApi().getSelectedRows();
		const initiators: TradeListExportInitiator[] = selectedRows.map(r => ({
			accountName: r.accountName as string
		}));
		let onlySelected = true;
		if (selectedRows.length === 0) {
			onlySelected = false;
		}
		return this.context.gridApi().exportDataAsTradeList({
			onlySelected,
			zipFilename: 'TradeLists',
			context: this.context,
			initiators: initiators
		});

	}
}
