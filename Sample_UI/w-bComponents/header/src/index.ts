import Template from './Header.vue';
import { notificationsService } from '@axioma/core';
import { Datepicker, SingleDropdown, createMenu } from '@axioma-framework/qontum';
import { Component, Prop, Vue } from '@axioma/vue';
import UserSettings from '@axioma-components/user-menu-settings';
import { createUserMenuSettingsPanel } from '@axioma-components/user-menu-settings-panel';
import logo from './../assets/logo.svg';
import { createReportBugModal } from '@axioma-components/report-bug-modal';
import { WorkspaceController } from '@axioma-framework/layout';
import { signOut, currentUser } from '@axioma/wealth-services';
import { createBatchUploadsPanel } from './panels/upload-batch-panel';
import { UserSettingsMenuItem, UserSettingsMenuItemState } from '@axioma/wealth-types';
import { fsUploadClicked, fsUserClicked } from './utils/fsEvents';

@Component({
	components: {
		Datepicker,
		SingleDropdown
	}
})
export default class Header extends Vue.extend(Template) {
	@Prop(EventTarget)
	public headerContainer!: (header: HTMLElement) => Promise<WorkspaceController>;

	protected settingsPanelOpen = false;
	protected uploadPanelOpen = false;
	protected logo = logo;
	protected username = '';
	private controller!: Promise<WorkspaceController>;

	protected created(): void {
		this.username = currentUser.name;
		this.$emit('loading', true);
	}

	protected mounted(): void {
		this.controller = this.headerContainer(this.$refs.tabContainer as HTMLElement);
	}

	protected showHome(): void {
		this.$emit('showWealthHomeApp');
	}

	protected onUploadClick(): void {
		fsUploadClicked();
		if (this.$parent && !this.uploadPanelOpen) {
			this.uploadPanelOpen = true;
			const elm = this.$parent.$refs.tableContainer as HTMLElement;
			elm.classList.remove('position-relative');
			createBatchUploadsPanel({ parent: this.$parent, elm })
				.then(() => {
					this.uploadPanelOpen = false;
				});
		}
	}

	protected onUserClick(): void {
		fsUserClicked();
		const container = this.$refs.userSettings as HTMLElement;
		this.controller.then(controller => {
			createMenu<UserSettingsMenuItem>({
				component: UserSettings,
				position: {
					from: container,
					rect: container.getBoundingClientRect(),
					x: {
						floating: 'right',
						from: 'right'
					},
					y: {
						floating: 'bottom',
						from: 'top'
					}
				},
				parent: this
			})
				.then(result => {
					switch (result) {
						case 'close':
							break;
						case 'settings':
							if (this.$parent && !this.settingsPanelOpen) {
								this.settingsPanelOpen = true;
								const elm = this.$parent.$refs.tableContainer as HTMLElement;
								elm.classList.remove('position-relative');
								createUserMenuSettingsPanel({ parent: this.$parent, elm })
									.then((res: UserSettingsMenuItemState) => {
										this.settingsPanelOpen = false;
										this.$emit(res);
									});
							}
							break;
						case 'logout':
							signOut();
							break;
						case 'reportBug':
							createReportBugModal(this, controller);
							break;
						case 'processingStatus':
							this.$emit('openProcessingStatus');
							break;
						default:
							notificationsService.notificationsServiceRegistry.warning({ title: 'Unmanaged settings pannel response: ' + result });
					}
				});
		});
	}
}