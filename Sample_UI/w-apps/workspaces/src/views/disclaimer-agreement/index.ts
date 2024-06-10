import en from '../../assets/en';
import DisclaimerAgreementComponent from './DisclaimerAgreement.vue';
import { notificationsService } from '@axioma/core';
import { plugins } from '@axioma/common';
import { Component, Prop } from '@axioma/vue';
import { ModalExtends, ButtonHandler, Button, ModalHeader } from '@axioma-framework/qontum';
import { userSettingsControllerRegistry } from '@axioma-api/wealth-user-settings';

plugins.lang.mergeLocaleMessage('en', en);
@Component({
	components: {
		Button,
		ModalHeader
	}
})
export default class DisclaimerAgreement extends ModalExtends(DisclaimerAgreementComponent) {
	@Prop()
	public token!: string;
	@Prop()
	public eulaText!: string;

	protected handlerDeclineButton: ButtonHandler = null as unknown as ButtonHandler;
	protected handlerAcceptButton: ButtonHandler = null as unknown as ButtonHandler;
	protected eula = '';

	protected created(): void {
		this.handlerAcceptButton = {
			title: plugins.lang.t('DISCLAIMER.ACCEPT').toString(),
			disabled: false,
			autofocus: true,
			onClick: this.onAccept
		};

		this.handlerDeclineButton = {
			title: plugins.lang.t('DISCLAIMER.DECLINE').toString(),
			disabled: false,
			onClick: this.onDecline
		};
	}

	protected mounted(): void {
		this.eula = this.eulaText.replace(/(?:#\[strong '([^”]+?)'\])/g, '<b>$1</b>')
			.split('  ').filter(x => x !== '').map(x => `<p class="marg-bottom-l">${x}</p>`).join('');
	}

	protected onAccept(): void {
		userSettingsControllerRegistry
			.putEula()
			.then(this.modalResolve, this.modalReject);
	}

	protected onDecline(): void {
		notificationsService.notificationsServiceRegistry.info({ title: this.$t('DISCLAIMER.DECLINE_MESSAGE') });
		this.modalReject(new Error('Agreement Declined'));
	}
}

