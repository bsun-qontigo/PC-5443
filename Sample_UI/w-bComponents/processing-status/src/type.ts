import { GridApi } from '@axioma-types/grid-wrapper';
import { WealthBatchJobRO } from '@axioma/wealth-types';

export type Context = {
	gridApi: () => GridApi<WealthBatchJobRO>;
	loading: boolean;
	onRefresh(): void;
	showErrors(data: WealthBatchJobRO): void;
	closeErrorsPanel(): void;
};
