import { Column } from '@ag-grid-community/core';

export type ColumnStateDTO = {
    colId: string;
    hide: boolean;
    width: number;
}
export function toColumnStateDTO(column: Column): ColumnStateDTO {
    return {
        colId: column.getColId(),
        hide: !column.isVisible(),
        width: column.getActualWidth()
    };
}