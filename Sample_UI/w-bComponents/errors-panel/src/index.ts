import { Vue, Component, compile, Prop, WrappedComponent, Public } from '@axioma/vue';
import { StandardNotificationHandler, StandardNotification, Banner, BannerHandler, Button, ButtonHandler, ButtonIcon, ButtonIconHandler } from '@axioma-framework/qontum';
import { ToOptionString } from '@axioma/core';
import { plugins } from '@axioma/common';
import { DateTime } from 'luxon';
import VueTemplate from './template.vue';

export type WealthErrorsPanelHandler<T> = {
	analysisDate?: DateTime;
	data: T;
	headerName: string;
	createNotificationHandlers: () => (StandardNotificationHandler[] | Promise<StandardNotificationHandler[]>);
}
export interface IWealthErrorsPanel<T> {
	updateWith(handler: WealthErrorsPanelHandler<T>): void;
}
@Component({
	name: 'wealth-errors-panel',
	components: {
		Banner,
		Button,
		ButtonIcon,
		StandardNotification
	},
	provide: () => {
		return {
			markAsRead: () => { return; },
			remove: () => { return; },
			read: () => false
		};
	}
})
class WealthErrorsPanel<T> extends Vue.extend(VueTemplate) implements IWealthErrorsPanel<T> {
	@Prop()
	public handler!: WealthErrorsPanelHandler<T>;

	protected handlerBanner: BannerHandler = null as unknown as BannerHandler;
	protected handlerCloseButtonIcon: ButtonIconHandler = null as unknown as ButtonIconHandler;
	protected handlerCancelButton: ButtonHandler = null as unknown as ButtonHandler;
	protected notificationHandlers: StandardNotificationHandler[] = [];

	@Public()
	public updateWith(handler: WealthErrorsPanelHandler<T>): void {
		Object.assign(this.handler, handler);
	}

	public clearBanner(): void {
		this.handlerBanner.title = undefined;
		this.handlerBanner.content = undefined;
	}

	protected notificationProvider = () => {
		return {
			markAsRead: () => { return; },
			remove: () => { return; },
			read: () => false
		};
	};

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

		this.$watch(() => this.handler.data, () => {
			const notificationHandlers = this.handler.createNotificationHandlers();
			if (notificationHandlers instanceof Promise) {
				notificationHandlers.then(h => {
					this.notificationHandlers = h;
				});
			} else {
				this.notificationHandlers = notificationHandlers;
			}
		}, { immediate: true });
	}

	protected onClose(): void {
		this.$emit('close');
	}

}

export function createErrorsPanel<T>({ parent, elm, headerName, data, createNotificationHandlers }: CreateErrorsPanelOptions<T>): WrappedComponent<IWealthErrorsPanel<T>> {
	const errorsPanel = compile<IWealthErrorsPanel<T>>({
		parent,
		component: WealthErrorsPanel,
		propsData: {
			handler: {
				data,
				headerName,
				createNotificationHandlers
			}
		}
	});
	errorsPanel.$mount();
	elm.appendChild(errorsPanel.$el);
	return errorsPanel;
}

export type CreateErrorsPanelOptions<T> = {
	parent: Vue;
	elm: HTMLElement;
	headerName: string;
	analysisDate?: DateTime;
	data: T;
	createNotificationHandlers(): StandardNotificationHandler[] | Promise<StandardNotificationHandler[]>;
}

