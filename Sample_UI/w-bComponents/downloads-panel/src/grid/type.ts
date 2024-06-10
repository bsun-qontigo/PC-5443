import { CellClickedEvent } from '@ag-grid-community/all-modules';

export type Context = {
    cancel: (ev: CellClickedEvent) => void;
    download: (ev: CellClickedEvent) => void;
}