import { DateTime } from 'luxon';
import { ICellRendererParams } from '@axioma-types/grid-wrapper';

export type RowData = {
	filename: string;
	dropDateTime: DateTime;
	size: string;
	status: 'Failed' | 'In Progress' | 'Wrong Extension' | 'Uploaded' | 'Uploading';
	file: File;
	ii: number;
	batchId?: string;
}

export type Context = {
	openProcessingStatus: (params: ICellRendererParams<RowData>) => void;
}
