import { IStatusPanelParams, IStatusPanelComp } from '@ag-grid-community/all-modules';
import { PillHandler, Pill } from '@axioma-framework/qontum';
import { compile, CreateElement, VNode, WrappedComponent } from '@axioma/vue';

export type PillsComponentParams = {
	handler: PillHandler & { show: boolean };
}
export class PillsComponent implements IStatusPanelComp {
	private element!: HTMLElement;
	private pillComponent!: WrappedComponent<{}>;
	public init(params: IStatusPanelParams & PillsComponentParams): void {
		const div = document.createElement('div');
		this.element = div;
		this.pillComponent = compile<Pill>({
			component: pill,
			propsData: {
				handler: params.handler
			}
		});

		this.element.appendChild(this.pillComponent.$elm);

		this.element.classList.add('marg-right-xxs');
		this.element.classList.add('qf-pills');
	}

	public getGui(): HTMLElement {
		return this.element;
	}
	public destroy(): void {
		this.pillComponent.destroy();
	}

}

const pill = {
	props: ['handler'],
	render(this: { handler: PillHandler & { show: boolean } }, h: CreateElement): VNode | undefined {
		if (this.handler.show) {
			return h(Pill, { props: { handler: this.handler } });
		}
		return undefined;
	}
};