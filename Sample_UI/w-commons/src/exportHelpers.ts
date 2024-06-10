import { ColumnApi, Column, GridApi, ColDef as GridColDef } from '@ag-grid-community/all-modules';
import { ColDef, RowNode } from '@axioma-types/grid-wrapper';
import { ICustomFormatting, IDataToExport } from '@axioma/wealth-types';
import { currentUser } from '@axioma/wealth-services';

export type ColumnExtraInfo = {
    supressExport?: boolean;
};

export function getFormatterText(formatter: string): string {
    const currencyDecimals = Number(currentUser.settings.decimalCurrencyValue);
    const percentDecimals = Number(currentUser.settings.percentDigits);
    const decimalPlaces = Number(currentUser.settings.decimalDigits);
    switch (formatter) {
        case 'decimal':
            return `#,##0.${'0'.repeat(decimalPlaces)}`;
        case 'currency':
            return `$#,##0.${'0'.repeat(currencyDecimals)}`;
        case 'percent':
            return `#,##0.${'0'.repeat(percentDecimals)}%`;
        default:
            return '';
    }
}

export function getCustomFormatting<T>(columns: ColDef<T>[]): ICustomFormatting {
    const customFormatting: string[] = [];
    const formatterNames: string[] = [];
    columns.forEach(col => {
        const formatter = (col as unknown as GridColDef & { formatter: { formatterName: string } })?.formatter?.formatterName;
        const formatterText = getFormatterText(formatter);
        customFormatting.push(formatterText);
        formatterNames.push(formatter);
    });
    return { customFormatting, formatterNames };
}

type ColId = string;
export type ExcelColumnFormatters = Record<ColId, (d: unknown) => string | Date>;
export type ExcelExportOpts = { all: boolean, columnKeys?: string[]; cellValueGetter?: (column: Column, node: RowNode<unknown>) => string | number | null; excelColumnFormatters?: ExcelColumnFormatters; }
export function getDataToExport(gridApi: GridApi, columnApi: ColumnApi, opts: ExcelExportOpts): IDataToExport {
    const cellValueGetter = opts?.cellValueGetter ?? ((column: Column, node: RowNode<unknown>) => gridApi.getValue(column, node));
    const excelColumnFormatters = opts?.excelColumnFormatters ?? {};
    const all = opts?.all;
    const columnKeys = opts?.columnKeys ?? [];
    const data: string[][] = [];
    const allColumns = (columnApi.getAllColumns() || [])
        .filter(supportExport)
        .filter(c => {
            if (columnKeys.length > 0) {
                return columnKeys.indexOf(c.getColId()) >= 0;
            } else {
                return isColumnVisible(c);
            }
        });
    const customFormatting = getCustomFormatting(allColumns.map(c => c.getColDef()));
    const columnsHeader = allColumns.map(c => c.getColDef().headerName ?? '');
    const iden = (v: unknown) => v;
    if (all) {
        gridApi.forEachNode(node => {
            const rowData: (string | Date)[] = [];
            allColumns?.forEach(column => {
                const customFormatter = excelColumnFormatters?.[column.getColId()] ?? iden;
                rowData.push(customFormatter(cellValueGetter?.(column, node)) as string | Date);
            });
            data.push(rowData as string[]);
        });
    } else {
        // TODO we need to remove this 
        const nodes = gridApi.getSelectedNodes();
        nodes.forEach(node => {
            const rowData: (string | Date)[] = [];
            allColumns?.forEach(column => {
                const customFormatter = excelColumnFormatters?.[column.getColId()] ?? iden;
                rowData.push(customFormatter(gridApi.getValue(column, node)) as string | Date);
            });
            data.push(rowData as string[]);
        });
    }

    return {
        headers: columnsHeader,
        data,
        ...customFormatting
    };
}
export function supportExport(c: Column): boolean {
    return !(((c.getColDef() as ColDef<unknown>).extraInfo ?? {}) as ColumnExtraInfo).supressExport;
}
export function isColumnVisible(c: Column): boolean {
    return c.isVisible();
}
export function toColumnKey(c: Column): string {
    return c.getColId();
}
