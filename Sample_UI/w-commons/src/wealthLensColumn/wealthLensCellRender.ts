import { ICellRendererComp } from '@ag-grid-community/all-modules';
import { GridHelpers } from '@axioma-framework/grid-wrapper';
import { ICellRendererParams, IBadgeNumberCellRenderParams, GridApi } from '@axioma-types/grid-wrapper';
import { Vue } from '@axioma/vue';
// import type { BatchOptimizationEntryOutputRO } from '@axioma/wealth-models';
import { WealthLensDrivers } from '.';
// import { createGrid } from './grid';
// import { ParentHandler, OneWayExpectations } from '@axioma/vue';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class WealthLensCellRender<BatchOptimizationEntryOutputRO = any> implements ICellRendererComp {
	protected element!: HTMLElement;
	protected popup!: HTMLElement;
	protected span!: HTMLElement;
	private watcher: Function | undefined;
	private gridApi!: GridApi<WealthLensDrivers>;
	public getGui(): HTMLElement {
		return this.element;
	}
	public onDestroy(): void {
		this.gridApi?.destroy();
	}

	public init(params: ICellRendererParams<BatchOptimizationEntryOutputRO> & IBadgeNumberCellRenderParams<BatchOptimizationEntryOutputRO>): void {
		this.element = document.createElement('div');
		const childDiv = document.createElement('div');
		this.element.classList.add('display-flex', 'cell-render', 'align-items-center', 'justify-content-end', 'all-height', GridHelpers.getQFCellLabel(params));
		this.span = document.createElement('span');
		this.span.style.display = 'inline-block';

		const colorClass = `badge-${params.badge(params)}`;
		childDiv.classList.add('q-cell-badge', 'badge', 'badge-number-style');
		childDiv.classList.add(colorClass);

		this.element.appendChild(childDiv);
		childDiv.appendChild(this.span);

		this.refresh(params);
	}

	public refresh(params: ICellRendererParams<BatchOptimizationEntryOutputRO> & IBadgeNumberCellRenderParams<BatchOptimizationEntryOutputRO>): boolean {
		this.watcher?.();
		this.watcher = Vue.watch(() => params.formatter(params.value), () => this.refresh(params));
		GridHelpers.customCellStyle(params, this.element);
		if (isNaN(params.value) || typeof params.value !== 'number') {
			this.span.innerText = params.value;
		} else {
			this.span.innerText = params.formatter(params.value);
		}

		return true;
	}
}

export const GroupedBadgeNumberCellRender = GridHelpers.groupFactory(WealthLensCellRender);