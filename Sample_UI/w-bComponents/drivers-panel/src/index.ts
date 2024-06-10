import { Vue, Component, compile, Prop, WrappedComponent, Public, Emit, TwoWayExpectations, ChildHandler, createTwoWayBinding, ParentHandler } from '@axioma/vue';
import { StandardNotificationHandler, Banner, BannerHandler, Button, ButtonHandler, ButtonIcon, ButtonIconHandler } from '@axioma-framework/qontum';
import { ToOptionString, Debouncer } from '@axioma/core';
import { plugins } from '@axioma/common';
import { DateTime } from 'luxon';
import VueTemplate from './template.vue';
import { WealthExtendedBatchOptimizationEntryOutputRO } from '@axioma/wealth-types';
import { IWealthDriversBody, WealthDriversBody } from './components/body';
import en from './assets/en';

plugins.lang.mergeLocaleMessage('en', en);

export type WealthDriversPanelExpectations = TwoWayExpectations<{
	analysisDate?: DateTime;
	data: WealthExtendedBatchOptimizationEntryOutputRO;
	headerName: string;
	loading: boolean;
}, {
	onClose(): void;
}, {
	updateWith(handler: ParentHandler<WealthDriversPanelExpectations>): void;
}>;

@Component({
	name: 'wealth-drivers-panel',
	components: {
		Banner,
		Button,
		ButtonIcon,
		WealthDriversBody
	}
})
export class WealthDriversPanel extends Vue.extend(VueTemplate) {
	@Prop()
	public handler!: ChildHandler<WealthDriversPanelExpectations>;

	public $refs!: { 'body': HTMLDivElement };
	protected loading = false;
	protected handlerBanner: BannerHandler = null as unknown as BannerHandler;
	protected handlerCloseButtonIcon: ButtonIconHandler = null as unknown as ButtonIconHandler;
	protected handlerCancelButton: ButtonHandler = null as unknown as ButtonHandler;
	protected notificationHandlers: StandardNotificationHandler[] = [];
	protected driversBody!: WrappedComponent<IWealthDriversBody>;

	private loader!: Debouncer;

	@Public()
	public updateWith(handler: ParentHandler<WealthDriversPanelExpectations>): void {
		Object.assign(this.handler, handler);
		this.driversBody.update();
	}

	/**
  * The component entered or exited a `loading` state
  * @arg {boolean} value - The current loading state
*/
	@Emit('loading')
	protected onLoading(value: boolean): boolean {
		this.loading = value;
		return value;
	}

	/**
	  * The component ran into an error
	  * @arg {any} error - The error `object`
	*/
	@Emit('error')
	protected onError(error: unknown): unknown {
		return error;
	}

	public clearBanner(): void {
		this.handlerBanner.title = undefined;
		this.handlerBanner.content = undefined;
	}

	protected created(): void {
		this.handlerBanner = {
			state: 'success',
			title: undefined,
			content: undefined,
			onClose: () => this.clearBanner()
		};

		this.handlerCloseButtonIcon = {
			icon: ToOptionString('fa-times'),
			title: this.$t('CLOSE'),
			onClick: this.onClose
		};
		this.handlerCancelButton = {
			title: plugins.lang.t('CLOSE').toString(),
			disabled: false,
			onClick: this.onClose
		};

		this.handler.init(this, {
			updateWith: this.updateWith
		});

		this.$watch(() => this.handler.data, () => {
			// TODO update
		}, { immediate: true });
	}

	protected mounted(): void {
		this.driversBody = compile<IWealthDriversBody>({
			parent: this,
			component: WealthDriversBody,
			propsData: {
				handler: this.handler
			}
		});
		this.driversBody.$mount();
		this.$refs.body.appendChild(this.driversBody.$el);
	}

	protected onClose(): void {
		this.handler.onClose();
	}
}

export function createDriversPanel({ parent, elm, headerName, data, loading, onClose }: CreateDriversPanelOptions): { handler: ParentHandler<WealthDriversPanelExpectations>; component: WrappedComponent<WealthDriversPanel> } {
	const handler = createTwoWayBinding<WealthDriversPanelExpectations>()
		.byRef('data', () => data)
		.byRef('analysisDate', () => undefined)
		.byRef('headerName', () => headerName)
		.byRef('loading', () => loading)
		.on('onClose', onClose)
		.create();
	const driversPanel = compile<WealthDriversPanel>({
		parent,
		component: WealthDriversPanel,
		propsData: {
			handler
		}
	});
	driversPanel.$mount();
	elm.appendChild(driversPanel.$el);
	return { handler, component: driversPanel };
}

export type CreateDriversPanelOptions = {
	parent: Vue;
	elm: HTMLElement;
	headerName: string;
	analysisDate?: DateTime;
	data: WealthExtendedBatchOptimizationEntryOutputRO;
	loading: boolean;
	onClose(): void;
}

export * from './wealth-drivers';