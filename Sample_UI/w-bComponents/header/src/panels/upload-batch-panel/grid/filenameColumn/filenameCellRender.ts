import { ICellRendererComp } from '@ag-grid-community/all-modules';
import { GridHelpers } from '@axioma-framework/grid-wrapper';
import { ICellRendererParams, GridApi } from '@axioma-types/grid-wrapper';
import { ButtonIcon, ButtonIconHandler } from '@axioma-framework/qontum';
import { compile, WrappedComponent } from '@axioma/vue';
import { ToOptionString } from '@axioma/core';
import { RowData } from '../type';

export class FilenameCellRender implements ICellRendererComp {
	protected element!: HTMLElement;
	protected popup!: HTMLElement;
	protected openLinkIcon!: HTMLElement;
	protected fileIcon!: HTMLElement;
	protected span!: HTMLElement;
	private gridApi!: GridApi<RowData>;
	public getGui(): HTMLElement {
		return this.element;
	}
	public onDestroy(): void {
		this.gridApi?.destroy();
	}

	public init(params: ICellRendererParams<RowData> & { onClicked: (params: ICellRendererParams<RowData>) => void }): void {
		this.element = document.createElement('div');
		const childDiv = document.createElement('div');
		this.element.classList.add('display-flex', 'cell-render', 'align-items-center', 'justify-content-start', 'all-height', GridHelpers.getQFCellLabel(params));

		const handlerButtonIcon: ButtonIconHandler = {
			icon: ToOptionString('fa-external-link'),
			disabled: false,
			onClick: () => params.onClicked(params)
		};

		const openLinkIcon = compile<ButtonIcon>({
			component: ButtonIcon,
			propsData: {
				handler: handlerButtonIcon
			}
		}) as WrappedComponent<ButtonIcon>;
		openLinkIcon.$mount();
		childDiv.appendChild(openLinkIcon.$el);

		this.fileIcon = document.createElement('i');
		this.fileIcon.classList.add('far', 'fa-file');
		this.span = document.createElement('span');
		this.span.style.display = 'inline-block';
		this.span.style.color = 'var(--qontum-data-grid-foreground)';
		this.span.style.backgroundColor = 'transparent';
		this.span.style.fontWeight = 'var(--qontum-data-grid-font-weight)';
		this.span.style.boxShadow = 'var(--qontum-data-grid-box-shadow) !important';
		this.span.style.fontFamily = 'var(--qontum-data-grid-font-family)';
		this.span.style.fontSize = 'var(--qontum-data-grid-font-size)';
		this.span.classList.add('upload-filename-column', 'text-overflow-ellipsis', 'overflow-hidden', 'all-width');
		childDiv.classList.add('display-flex', 'align-items-center', 'gap-xxs', 'overflow-hidden');

		this.element.appendChild(childDiv);
		childDiv.appendChild(this.fileIcon);
		childDiv.appendChild(this.span);

		this.refresh(params);
	}

	public refresh(params: ICellRendererParams<RowData> & { onClicked: (params: ICellRendererParams<RowData>) => void }): boolean {
		this.span.innerText = params.value;
		this.span.title = this.span.innerText;
		return true;
	}
}

export const GroupedFilenameCellRender = GridHelpers.groupFactory(FilenameCellRender);