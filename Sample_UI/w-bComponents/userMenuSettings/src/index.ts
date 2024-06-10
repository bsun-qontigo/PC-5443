import Template from './UserSettings.vue';
import { Component, MenuExtends } from '@axioma/vue';
import en from './assets/en';
import { plugins } from '@axioma/common';
import { UserSettingsMenuItem } from '@axioma/wealth-types';
import { currentUser } from '@axioma/wealth-services';
import { fsUserSettingLogout, fsUserSettingProcessingStatus, fsUserSettingReportBug, fsUserSettingsSettingsClicked } from './utils/fsEvents';

plugins.lang.mergeLocaleMessage('en', en);

@Component({})
export default class UserSettings extends MenuExtends<UserSettingsMenuItem>(Template) {
	
	protected get isAxiomaUser(): boolean {
		return !!currentUser.isAxiomaUser();
	}

	protected mounted(): void {
		this.menuListen('keydown', ev => {
			if (ev.key === 'Escape') {
				this.menuResolve('close');
			}
		});
		this.menuListen('click', ev => {
			if (!this.$el || this.$el.contains(ev.target as Element)) {
				return;
			} else {
				this.menuResolve('close');
			}
		});
	}

	protected logout(): void {
		fsUserSettingLogout();
		this.menuResolve('logout');
	}

	protected onReportBug(): void {
		fsUserSettingReportBug();
		this.menuResolve('reportBug');
	}

	protected onSettingsClicked(): void {
		fsUserSettingsSettingsClicked();
		this.menuResolve('settings');
	}

	protected onProcessingStatusClicked(): void {
		fsUserSettingProcessingStatus();
		this.menuResolve('processingStatus');
	}

}