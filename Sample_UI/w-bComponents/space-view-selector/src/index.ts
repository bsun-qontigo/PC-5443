import { Component, Vue, Prop, ParentHandler, TwoWayExpectations, createOneWayBinding, ChildHandler } from '@axioma/vue';
import VueTemplate from './template.vue';
import en from './assets/en';
import { plugins } from '@axioma/common';
import { ToggleButton, ToggleButtonExpectations } from '@axioma-framework/qontum';

plugins.lang.mergeLocaleMessage('en', en);

const _WealthDataView = ['initial', 'final'] as const;
const _WealthDataSpace = ['total', 'active'] as const;
export type WealthDataView = typeof _WealthDataView[number];
export type WealthDataSpace = typeof _WealthDataSpace[number];
export type SpaceViewSelectorHandler = TwoWayExpectations<{}, {
	onSpaceChanged: (ev: WealthDataSpace) => void;
	onViewChanged: (ev: WealthDataView) => void;
}, {
	setSelectedView: (view: WealthDataView) => void;
	setDisableViewSelector: (set: boolean) => void;
	setViewValues: (list: WealthDataView[]) => void;
}>;

export const keyToI18n = (key: WealthDataView | WealthDataSpace): string => {
	let k = '';
	switch (key) {
		case 'initial':
			k = 'INITIAL';
			break;
		case 'final':
			k = 'FINAL';
			break;
		case 'total':
			k = 'TOTAL';
			break;
		case 'active':
			k = 'ACTIVE';
			break;
		default:
			break;
	}
	return plugins.lang.t(k).toString();
};

@Component({
	name: 'wealth-space-view-selector',
	packageName: '@axioma-components/wealth-space-view-selector',
	components: {
		ToggleButton
	}
})
export default class SpaceAndViewSelectorComponent extends Vue.extend(VueTemplate) {
	@Prop({
		type: Object,
		required: true
	})
	protected handler!: ChildHandler<SpaceViewSelectorHandler>;

	protected toggleButtonTotalOrActive = null as unknown as ParentHandler<ToggleButtonExpectations<WealthDataSpace>, 'values'>;
	protected toggleButtonInitialOrFinal = null as unknown as ParentHandler<ToggleButtonExpectations<WealthDataView>, 'values'>;

	private selectedSpace: WealthDataSpace = 'total';
	private selectedView: WealthDataView = 'final';

	protected created(): void {
		this.handler.init(this, {
			setSelectedView: (view) => {
				this.selectedView = view;
			},
			setDisableViewSelector: (set) => {
				this.toggleButtonInitialOrFinal.disabled = () => set;
			},
			setViewValues: (list)=> {
				this.toggleButtonInitialOrFinal.values = () => list;
			}
		});
		this.createToggleButtonsHandlers();
	}

	private createToggleButtonsHandlers(): void {
		this.toggleButtonTotalOrActive = createOneWayBinding<ToggleButtonExpectations<WealthDataSpace>>()
			.owned('values', _WealthDataSpace as unknown as [])
			.byRef('disabled', () => undefined)
			.byRef('options', () => {
				return {
					label: (value) => {
						switch (value) {
							case 'total':
								return this.$t('TOTAL').toString();
							case 'active':
							default:
								return this.$t('ACTIVE').toString();
						}
					},
					selected: (value) => value === this.selectedSpace,
				};
			})
			.on('onClick', (ev) => {
				this.selectedSpace = ev;
				this.handler.onSpaceChanged(ev);
			})
			.create();
		this.toggleButtonInitialOrFinal = createOneWayBinding<ToggleButtonExpectations<WealthDataView>>()
			.owned('values', _WealthDataView as unknown as [])
			.byRef('disabled', () => undefined)
			.byRef('options', () => {
				return {
					label: (value) => {
						switch (value) {
							case 'initial':
								return this.$t('INITIAL').toString();
							case 'final':
							default:
								return this.$t('FINAL').toString();
						}
					},
					selected: (value) => value === this.selectedView,
				};
			})
			.on('onClick', (ev) => {
				this.selectedView = ev;
				this.handler.onViewChanged(ev);
			})
			.create();
	}

}