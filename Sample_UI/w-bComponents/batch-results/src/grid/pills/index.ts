import { StatusPanelDef } from '@ag-grid-community/all-modules';
import { HandleOptions, MultiGridOptions } from '@axioma-types/grid-wrapper';
import { PillsComponent, PillsComponentParams } from './pillsComponent';
export type PillsOptions = PillsComponentParams & Pick<StatusPanelDef, 'key' | 'align'>;
export { PillsComponentParams };
export function createPills<RowData>(opts: PillsOptions): HandleOptions<RowData> {
	return function (option: MultiGridOptions<RowData>): MultiGridOptions<RowData> {
		const {
			key,
			align,
			handler
		} = opts;

		option.statusBar = option.statusBar || { statusPanels: [] };

		option.statusBar.statusPanels.push({
			align,
			key,
			statusPanel: PillsComponent,
			statusPanelParams: {
				handler
			}
		});

		return option;
	};
}