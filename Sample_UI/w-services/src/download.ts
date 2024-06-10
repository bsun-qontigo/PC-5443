import JSZip from 'jszip';
import FileSaver from 'file-saver';
import { ExcelDownloadRequest, IRowTracking, MultipleExcelDownloadRequest, SingleExcelDownloadRequest } from '@axioma/wealth-types';
import { utils } from '@axioma/common';
import { Workbook, Worksheet, RowModel } from 'exceljs';

export async function downloadAsZip(requests: { fileContent: Blob; filename: string; fileExtension: string; }[], zipFilename: string): Promise<void> {
	const _zip = new JSZip();
	const checkDuplicateFilenames = (() => {
		// temp workaround until we have unique account names;
		const _map = Object.create(null);
		return (filename: string) => {
			if (filename in _map) {
				_map[filename] += 1;
			} else {
				_map[filename] = 0;
			}
			return _map[filename];
		};
	})();
	const inferUniqueFilename = (filename: string): string => {
		const i = checkDuplicateFilenames(filename);
		return i > 0 ? `${filename} (${i})` : filename;
	};
	requests.forEach(({ fileContent, filename, fileExtension }) => _zip.file(`${inferUniqueFilename(filename)}.${fileExtension}`, fileContent));
	return _zip.generateAsync({ type: 'blob' })
		.then((blob: Blob) => FileSaver.saveAs(blob, `${zipFilename}.zip`));
}

export function exportAsExcelMultiple(request: MultipleExcelDownloadRequest): Promise<void> {
	const props = request.props;
	const workbook = new Workbook();
	fromProps(workbook, props);
	request.sheets.forEach(sheet => {
		const rowTracking = new RowTracking();
		const data = sheet.data;
		const formatter = sheet.data.customFormatting;
		const formatterNames = sheet.data.formatterNames;
		const name = sheet.name;
		const eachRow = (sheet.eachRow ? sheet.eachRow.bind(null, rowTracking) : defaultEachRow.bind(null, rowTracking)) as (worksheet: Worksheet, formatting: string[], formatterNames: string[], row: string[] | Partial<RowModel & { role: string }>, _index: number) => void;
		const sheetHeaders = sheet.sheetHeaders ?? [];
		const worksheet = workbook.addWorksheet(typeof name === 'string' ? name : name());
		if (sheetHeaders.length > 0) {
			addSheetHeader(worksheet, sheetHeaders, rowTracking);
		}
		if (data.headers?.length > 0) {
			worksheet.addRow(data.headers);
			addRowBold(rowTracking.getter(), worksheet);
			rowTracking.increment();
		}
		data.data.forEach(eachRow.bind(null, worksheet, formatter, formatterNames));
		resizeColumns(worksheet);
	});
	const fileName = `export${new Date().toUTCString()}`;
	return new ExcelFileOutput(workbook).writeTo(fileName);
}

export function exportAsExcelSingle(request: SingleExcelDownloadRequest): Promise<void> {
	const rowTracking = new RowTracking();
	const props = request.props;
	const data = request.data;
	const formatter = request.data.customFormatting;
	const formatterNames = request.data.formatterNames;
	const name = request.name;
	const eachRow = defaultEachRow.bind(null, rowTracking);
	const sheetHeaders = request.sheetHeaders ?? [];
	const workbook = new Workbook();
	fromProps(workbook, props);
	const worksheet = workbook.addWorksheet(typeof name === 'string' ? name : name());
	if (sheetHeaders.length > 0) {
		addSheetHeader(worksheet, sheetHeaders, rowTracking);
	}
	worksheet.addRow(data.headers);
	addRowBold(rowTracking.getter(), worksheet);
	rowTracking.increment();
	(data.data as string[][]).forEach(eachRow.bind(null, worksheet, formatter, formatterNames));
	resizeColumns(worksheet);
	const fileName = `export${new Date().toUTCString()}`;
	return new ExcelFileOutput(workbook).writeTo(fileName);
}

const defaultEachRow = (rowTracking: RowTracking, worksheet: Worksheet, formatting: string[], formatterNames: string[], row: string[], _index: number): void => {
	worksheet.addRow(row);
	const rowAdded = worksheet.getRow(rowTracking.getter());
	rowAdded.eachCell((cell, idx) => {
		if (formatting[idx - 1] && formatting[idx - 1] !== '' && cell.value !== '') {
			if (formatterNames[idx - 1]?.toLowerCase() === 'percent') {
				cell.value = Number.isNaN(cell.value) ? null : Number(cell.value) / 100;
			} else {
				cell.value = Number.isNaN(cell.value) ? null : Number(cell.value);
			}
			if (cell.value !== null) {
				cell.numFmt = formatting[idx - 1];
			} else {
				cell.numFmt = '';
			}
		}
	});
	rowTracking.increment();
};

class ExcelFileOutput implements IExcelFileOutput {
	private static readonly BLOB_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
	public constructor(private readonly workbook: Workbook) { }
	public async writeTo(filename: string): Promise<void> {
		return this.workbook.xlsx.writeBuffer()
			.then(data => {
				const blob = new Blob([data], { type: ExcelFileOutput.BLOB_TYPE });
				FileSaver.saveAs(blob, filename);
			})
			.catch(e => {
				// TODO error handling downstream
				throw e;
			});
	}
}
interface IOutput {
	writeTo(arg?: unknown): Promise<void>;
}
interface IExcelFileOutput extends IOutput {
	writeTo(filename: string): Promise<void>;
}

function fromProps(workbook: Workbook, props: ExcelDownloadRequest['props']): void {
	const { today } = utils.dateUtils;
	const jsToday = today().toJSDate();
	workbook.creator = props.creator ?? 'Axioma';
	workbook.lastModifiedBy = props.lastModifiedBy ?? 'Axioma';
	workbook.created = props.created ?? jsToday;
	workbook.modified = props.modified ?? jsToday;
	workbook.lastPrinted = props.lastPrinted ?? jsToday;
}

function splitBy<T>(source: T[], delimiter: string): T[][] {
	const results: T[][] = [];
	let t: T[] = [];
	source.forEach((h, i) => {
		if (h === delimiter) {
			results.push(t);
			t = [];
		} else {
			t.push(h);
			if (i === source.length - 1) {
				results.push(t);
			}
		}
	});
	return results;
}

function addSheetHeader(worksheet: Worksheet, sheetHeaders: Array<string | Date>, rowTracking: RowTracking): void {
	const sheetHeaders_ = splitBy(sheetHeaders, '\r\n');
	for (const h of sheetHeaders_) {
		worksheet.addRow(h);
		addRowBackground(rowTracking.getter(), worksheet);
		addRowBold(rowTracking.getter(), worksheet);
		if (rowTracking.getter() === sheetHeaders_.length) {
			addRowBorderBottom(rowTracking.getter(), worksheet);
		}
		rowTracking.increment();
	}
	worksheet.addRow([]);
	rowTracking.increment();
}

function addRowBackground(rowTracking: number, currentWorksheet: Worksheet): void {
	const selectedRow = currentWorksheet.getRow(rowTracking);
	selectedRow.fill = {
		type: 'pattern',
		pattern: 'solid',
		fgColor: { argb: 'FFDCE6F1' }
	};
}

function addRowBorderBottom(rowTracking: number, currentWorksheet: Worksheet): void {
	const selectedRow = currentWorksheet.getRow(rowTracking);
	selectedRow.border = {
		bottom: { style: 'double', color: { argb: 'FF000000' } }
	};
}

export function addRowBold(rowTracking: number, currentWorksheet: Worksheet): void {
	const selectedRow = currentWorksheet.getRow(rowTracking);
	selectedRow.font = { bold: true };
}

function resizeColumns(worksheet: Worksheet): void {
	worksheet.columns.forEach(column => {
		const lengths = column.values ? column.values.map(v => v ? v.toString().length : 10) : [];
		const maxLength = Math.max(...lengths.filter(v => typeof v === 'number'));
		column.width = maxLength;
	});
}

export class RowTracking implements IRowTracking {
	private value: number;

	public constructor(initValue = 1) {
		this.value = (typeof initValue === 'undefined' || initValue === null) ? 1 : initValue;
	}

	public getter(): number {
		return this.value;
	}

	public increment(): void {
		this.value += 1;
	}
}