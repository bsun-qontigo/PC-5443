import { sanitizeValue, sanitizeCsvValue } from '@axioma/core';
import { ColumnGetterSetter, HandleOptions, MultiGridOptions, RowNode, ColDef, IBadgeNumberCellRenderParams, ValueGetterParams } from '@axioma-types/grid-wrapper';
import { Header, GridHelpers } from '@axioma-framework/grid-wrapper';
import { WealthLensCellRender, GroupedBadgeNumberCellRender } from './wealthLensCellRender';

export * from './wealthLensCellRender';

export type WealthLensDrivers = { key: string, value: number };

export type ReadOnlyBadgeNumberColumnOption<RowData> = {
	editable: false;
	field: OptionalPath<RowData, string | number | null> | Omit<ColumnGetterSetter<number | null, RowData>, 'setter'>;
	badgeNumberCellRenderParams: IBadgeNumberCellRenderParams<RowData>;
	headerExtraIcon?: string;
	comparator?: (valueA: number, valueB: number) => number;
	groupFormatter?: (value: unknown) => string;
	filter?: string;
	filterParams?: unknown;
	extraInfo?: {
		[key: string]: string | number | boolean;
	}
} & Omit<ColDef<RowData>, 'field' | `cellRenderer${string}` | `cellEditor${string}`>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function create<RowData = any>(opts: ReadOnlyBadgeNumberColumnOption<RowData>): HandleOptions<RowData> {
	return function (gridOpts: MultiGridOptions<RowData>): void {
		const {
			field,
			badgeNumberCellRenderParams,
			comparator,
			groupFormatter,
			extraInfo,
			headerExtraIcon,
			customCellStyle,
			sortable,
			valueGetter,
			filter,
			filterParams
		} = opts;

		const renderParams = badgeNumberCellRenderParams;
		const cellRendererParams: IBadgeNumberCellRenderParams<RowData> = {
			badge: renderParams.badge,
			formatter: renderParams.formatter,
			step: renderParams.step
		};

		const { getter, setter } = GridHelpers.parseGetterSetter<number | string | null, RowData>(field);
		const valGet = valueGetter ? valueGetter : ((params: ValueGetterParams<RowData>) => {
			if (!params.node) {
				return null;
			}

			if (params.node.group) {
				return GridHelpers.getGroupData(params);
			}

			return getter(params.node);
		});

		const actualExportCellValue = opts.exportCellValue ?? ((mode, params) => {
			if (!params.node) {
				return null;
			}

			let value: string;
			if (params.node.group) {
				value = GridHelpers.getGroupData(params);
			} else {
				const val = checkInfinity(getter(params.node));
				if (val === null || val === undefined) {
					value = '';
				} else {
					value = String(val);
				}
			}
			switch (mode) {
				case 'Clipboard':
					return sanitizeValue(value);
				case 'Csv':
					return sanitizeCsvValue(value);
				case 'Excel':
					return sanitizeValue(value);
				default:
					return '';
			}
		});
		gridOpts.columnDefs.push(Object.assign({}, opts, {
			field: undefined,
			sortable: sortable ? sortable : false,
			resizable: true,
			showRowGroup: groupFormatter ? true : undefined,
			extraInfo,
			customCellStyle,
			cellEditorPopup: true,
			valueGetter: valGet,
			valueSetter: params => {
				if (params.node) {
					setter(params.node, params.newValue);
				}

				return true;
			},
			cellRenderer: groupFormatter ? GridHelpers.GroupCellRender : WealthLensCellRender,
			cellRendererParams: groupFormatter ? {
				innerRenderer: GroupedBadgeNumberCellRender,
				groupFormatter: groupFormatter,
				...cellRendererParams
			} : cellRendererParams,
			filter: filter || 'agNumberColumnFilter',
			filterParams: filterParams || {
				valueGetter: (node: RowNode<RowData>) => getter(node)
			},
			menuTabs: ['filterMenuTab', 'generalMenuTab', 'columnsMenuTab'],
			headerComponent: Header,
			headerTooltip: opts.headerTooltip || opts.headerName,
			headerComponentParams: {
				headerExtraIcon: headerExtraIcon,
				rightAlign: true
			},
			getQuickFilterText: params => getter(params.node)?.toString(),
			comparator: comparator || defaultComparator,
			suppressKeyboardEvent: params => params.editing && (GridHelpers.onEscape(params.event) || GridHelpers.onEnter(params.event) || GridHelpers.onTab(params.event)),
			exportCellValue: actualExportCellValue
		} as ColDef<RowData>));
	};
}

function checkInfinity(number: number | string | null): number | string | null {
	if (typeof number !== 'number') {
		return number;
	}
	if (number && !isFinite(number)) {
		return NaN;
	}
	return number;
}

function defaultComparator(valueA: number, valueB: number): number {
	if (valueA) {
		if (valueB) {
			return valueA <= valueB ? -1 : 1;
		}

		return 1;
	}

	return valueB ? -1 : 0;
}
