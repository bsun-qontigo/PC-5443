import { Component, Vue } from '@axioma/vue';
import VueTemplate from './template.vue';
import en from './assets/en';
import { plugins } from '@axioma/common';
import { None, Some } from '@axioma/core';
import { Button, ButtonHandler, Textfield, TextFieldHandler } from '@axioma-framework/qontum';
import { WealthConfig } from '@axioma/wealth-config';

plugins.lang.mergeLocaleMessage('en', en);

@Component({
	name: 'wealth-demo-components',
	packageName: '@axioma-components/wealth-demo-components',
	components: {
		Button,
		Textfield
	}
})
export default class DemoComponents extends Vue.extend(VueTemplate) {
	protected buttonHandler: ButtonHandler = null as unknown as ButtonHandler;
	protected textFieldHandler: TextFieldHandler = null as unknown as TextFieldHandler;
	protected i = 0;
	protected status = 0;
	protected date = '';
	protected strategies: string[] = [];
	protected uploadStatus = '';
	protected created(): void {
		this.buttonHandler = {
			title: plugins.lang.t('DEMO').toString(),
			disabled: false,
			autofocus: true,
			onClick: () => {
				this.textFieldHandler.value = Some(`${this.i++}`);
			}
		};

		this.textFieldHandler = {
			value: None(),
			placeholder: this.$t('APP_COLLECTOR.DESCRIBE'),
			onInput: val => this.textFieldHandler.value = val
		};

		this.getStrategies();

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(window as any).electronAPI.onUploadResult((value: string) => {
			this.uploadStatus = value;
		});

	}

	protected getStrategies(): void {
		const accessToken = sessionStorage.getItem('access-token');
		fetch(`${WealthConfig.cdnUrl}/batch/api/v1/tasks/strategies`, {
			headers: {
				Authorization: `Bearer ${accessToken}`
			}
		}).then(r => r.json())
			.then(value => {
				this.date = value.date;
				this.strategies = value.strategyNames;
			});
	}
}