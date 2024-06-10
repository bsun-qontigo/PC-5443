import { Vue, Component, Prop } from '@axioma/vue';
import Template from './ReportBugModal.vue';
import { ModalHeader, ModalExtends, createModal, Textarea, Textfield, TextAreaHandler, TextFieldHandler } from '@axioma-framework/qontum';
import { None, notificationsService } from '@axioma/core';
import { WorkspaceController } from '@axioma-framework/layout';
import en from './assets/en';
import { plugins } from '@axioma/common';
import { fetcher, currentUser } from '@axioma/wealth-services';

plugins.lang.mergeLocaleMessage('en', en);

const JIRA_URL = 'https://qontigo-cloud.atlassian.net/rest/collectors/1.0/template/custom';
const TAB_SIZE = 2;
const COLLECTORS = {
	PC_COLLECTOR: {
		collectorId: '71b4435e',
		atlToken: 'baa24d38bdaedb6e41b81891c2c025a8c514f123_lout',
		pid: 10104,
	}
};
export class Collector<T, U extends typeof COLLECTORS[keyof typeof COLLECTORS]> {

	private readonly collectorId: string;
	private readonly atlToken: string;
	private readonly pid: number;

	private readonly constants: { [x: string]: unknown };

	public constructor(collector: U) {
		const { collectorId, atlToken, pid, ...constants } = collector;
		this.collectorId = collectorId;
		this.atlToken = atlToken;
		this.pid = pid;
		this.constants = constants;
	}

	public createJira(body: Omit<T & { fullname: string; email: string }, keyof U>): Promise<FetchResponse<void>> {
		const { collectorId, atlToken, pid, constants } = this;
		const options = {
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			mode: 'no-cors' as RequestMode,
			body: Object.entries({
				pid,
				atl_token: atlToken,
				...constants,
				...body
			})
				.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
				.join('&')
		};
		return fetcher.post<void>(`${JIRA_URL}/${collectorId}`, options);
	}

}
const pcCollectorInstance = new Collector<{ summary: string; description: string }, typeof COLLECTORS.PC_COLLECTOR>(COLLECTORS.PC_COLLECTOR);
@Component({
	name: 'report-bug-modal',
	components: {
		Textarea,
		ModalHeader,
		Textfield
	}
})
class ReportBugModal extends ModalExtends<'close'>(Template) {
	@Prop()
	protected workspaceController!: WorkspaceController;

	protected isSaving = false;

	protected summaryHandler: TextFieldHandler = null as unknown as TextFieldHandler;
	protected descriptionHandler: TextAreaHandler = null as unknown as TextAreaHandler;
	protected get cannotSubmit(): boolean {
		return !this.summaryHandler?.value.some || !this.descriptionHandler?.value.some || this.isSaving;
	}

	protected created(): void {
		this.summaryHandler = {
			value: None(),
			onInput: val => this.summaryHandler.value = val
		};

		this.descriptionHandler = {
			value: None(),
			placeholder: this.$t('APP_COLLECTOR.DESCRIBE'),
			onInput: val => this.descriptionHandler.value = val
		};
	}

	protected mounted(): void {
		this.modalListen('keydown', e => {
			if (e.key === 'Escape') {
				this.modalResolve('close');
			}
		});
	}

	protected onCancel(): void {
		this.modalResolve('close');
	}

	protected onSubmit(): void {
		this.isSaving = true;
		this.jiraBody()
			.then(body => pcCollectorInstance.createJira(body))
			.then(() => {
				notificationsService.notificationsServiceRegistry.successToast({ title: this.$t('APP_COLLECTOR.CREATED_SUCCESSFULLY') });
				this.modalResolve('close');
			})
			.catch(e => {
				notificationsService.notificationsServiceRegistry.danger({ title: this.$t('APP_COLLECTOR.FAILED'), body: e });
				this.modalResolve('close');
			});
	}

	private jiraBody(): Promise<typeof pcCollectorInstance.createJira extends (x: infer U) => unknown ? U : never> {
		return Promise.resolve(this.workspaceController.getSelectedTab())
			.then(selected => {
				return ({
					fullname: currentUser.name,
					email: currentUser.emails[0],
					summary: this.summaryHandler.value.unwrapOr(''),
					description: `
{panel:bgColor=#eae6ff}
h3. Description

${this.descriptionHandler.value.unwrapOr('')}
{panel}

----

+*CONTEXT:*+

||*Property*||*Value*||
|Project|*Wealth*|
|Environment|${location.origin}|
|Version|${Config.version.versionNumber} - ${Config.version.versionType}|
|Application|${(selected.renderedModule)}|
|Application state|{code:json}
${JSON.stringify(selected.getState(), null, TAB_SIZE)}
{code}|

----

+*REPORTER INFO:*+
`});
			});
	}

}

export function createReportBugModal(parent: Vue, workspaceController: WorkspaceController | undefined): Promise<'close'> {
	return createModal({
		parent,
		module: '',
		component: ReportBugModal,
		contentClass: 'modal-sm',
		propsData: {
			workspaceController
		}
	});
}