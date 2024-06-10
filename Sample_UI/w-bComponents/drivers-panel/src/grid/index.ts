import { Grid, TextColumn, GridHelpers } from '@axioma-framework/grid-wrapper';
import { plugins } from '@axioma/common';
import { getContextMenuItems } from './contextMenu';
import { CreateGridOptions, GridApi, GridReadyEvent, HandleOptions, CellClassRules } from '@axioma-types/grid-wrapper';
import { userApplicationStateClientRegistry } from '@axioma-api/wealth-user-application-state';
import { WealthBadgeColor, WealthLensColumn, getBadge } from '@axioma/wealth-commons';
import type { ICellRendererParams, CellClassParams } from '@axioma-types/grid-wrapper';
import type { ICellRendererComp } from '@ag-grid-community/all-modules';

export type Context = {
	gridApi: GridApi<WealthLensColumn.WealthLensDrivers>;
}

export function createGrid({ context, elm }: CreateGridOptions<Context>): Promise<GridReadyEvent<WealthLensColumn.WealthLensDrivers>> {
	return Grid
		.create<WealthLensColumn.WealthLensDrivers>({
			elm,
			handlers: [
				...GridColumns()
			],
			options: {
				context,
				defaultColDef: {
					editable: false,
					menuTabs: ['filterMenuTab', 'generalMenuTab', 'columnsMenuTab'],
					flex: 1
				},
				rowSelection: 'multiple',
				getContextMenuItems: getContextMenuItems,
				pinnedTopRowData: [{ key: 'Overall', value: null }],
			}
		});
}

const GridColumns = (): HandleOptions<WealthLensColumn.WealthLensDrivers>[] => ([
	TextColumn.create({
		headerName: plugins.lang.t('WEALTH_LENS_DRIVERS.DRIVER').toString(),
		field: 'key',
		editable: false,
		cellRendererSelector: params => {
			if (params.node.rowPinned) {
				return {
					component: PinnedTotalRowRenderer,
					params: {
						style: {
							color: 'var(--qontum-data-grid-foreground)',
							fontFamily: 'var(--qontum-data-grid-font-family)',
							fontSize: 'var(--qontum-data-grid-font-size)',
							lineHeight: 'var(--qontum-data-grid-line-height)',
							fontWeight: 'var(--font-weight-bold)',
						},
					},
				};
			} else {
				return undefined;
			}
		},
	}),
	WealthLensColumn.create({
		headerName: plugins.lang.t('VALUE').toString(),
		field: 'value',
		editable: false,
		badgeNumberCellRenderParams: {
			formatter: userApplicationStateClientRegistry.getFormatter('decimal'),
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			badge: driversBadge as unknown as any,
		},
		cellClassRules: {
			healthScoreSuccess: params => driversBadge(params) === 'success',
			healthScoreWarning: params => driversBadge(params) === 'warning',
			healthScoreInfo: params => driversBadge(params) === 'neutral',
			healthScoreError: params => driversBadge(params) === 'error',
		} as Record<HealthScoreStyleKey, RecordValue<CellClassRules<WealthLensColumn.WealthLensDrivers>>>,
		sortable: true
	})
]);
type RecordValue<T extends Record<string, unknown>> = T extends Record<string, infer U> ? U : never;
type HealthScoreStyleKey = 'healthScoreSuccess' | 'healthScoreWarning' | 'healthScoreInfo' | 'healthScoreError';
function driversBadge(value: ICellRendererParams<WealthLensColumn.WealthLensDrivers> | CellClassParams<WealthLensColumn.WealthLensDrivers>): WealthBadgeColor {
	const healthScoreValue = value.value;
	return getBadge(healthScoreValue);
}

function setStyle(element: HTMLElement, propertyObject: Record<string, string>) {
	Object.assign(element.style, propertyObject);
}

class PinnedTotalRowRenderer<RowData> implements ICellRendererComp {
	protected eGui!: HTMLElement;

	public init(params: ICellRendererParams<RowData> & { style?: Record<string, string>; value: string }): void {
		this.eGui = document.createElement('div');
		this.eGui.classList.add('display-flex', 'cell-render', 'align-items-center', 'justify-content', 'all-height', GridHelpers.getQFCellLabel(params));
		setStyle(this.eGui, params.style as Record<string, string>);
		this.eGui.innerHTML = params.value;
	}

	public getGui(): HTMLElement {
		return this.eGui;
	}

	public refresh(_params: ICellRendererParams<RowData>): boolean {
		return false;
	}
}