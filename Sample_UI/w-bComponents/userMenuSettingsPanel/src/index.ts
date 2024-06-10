import { Vue, Component, compile, ParentHandler, createOneWayBinding } from '@axioma/vue';
import Template from './UserMenuSettingsPanel.vue';
import { SingleDropdown, SingleDropdownOptions, SingleDropdownHandler, Banner, BannerHandler, Button, ButtonHandler, ButtonIcon, ButtonIconHandler, Textfield, TextFieldHandler, ToggleButton, ToggleButtonExpectations } from '@axioma-framework/qontum';
import { ToOptionString } from '@axioma/core';
import { NumberFormat, numberFormatValues, type IWealthWorkspaceSetting } from '@axioma-api/wealth-utils';
import { plugins, changeTheme } from '@axioma/common';
import { WealthUserDTO } from '@axioma-api/wealth-user-application-state';
// import * as credentials from '../../../.bin/credentials.json';
import en from './assets/en';
import { WealthWorkspaceSettingDTO, currentUser } from '@axioma/wealth-services';
import { UserSettingsMenuItemState } from '@axioma/wealth-types';
import { fsBpsDigitsChanged, fsDecimalCurrencyChanged, fsDecimalDigitsChanged, fsNumberFormatChanged, fsPercentDigitsChanged, fsThemeChanged, fsUserSettingsClosed, fsUserSettingsReset, fsUserSettingsSaved } from './utils/fsEvents';

plugins.lang.mergeLocaleMessage('en', en);

@Component({
	name: 'user-menu-settings-panel',
	components: {
		Banner,
		Button,
		ButtonIcon,
		Textfield,
		ToggleButton,
		SingleDropdown
	}
})
class UserMenuSettingsPanel extends Vue.extend(Template) {
	protected user: WealthUserDTO | null = null;
	protected settings: WealthWorkspaceSettingDTO | null = null;

	protected handlerBanner: BannerHandler = null as unknown as BannerHandler;
	protected handlerCloseButtonIcon: ButtonIconHandler = null as unknown as ButtonIconHandler;
	protected handlerEmailTextField: TextFieldHandler = null as unknown as TextFieldHandler;
	protected handlerThemeList: ParentHandler<ToggleButtonExpectations<string>> = null as unknown as ParentHandler<ToggleButtonExpectations<string>>;
	protected handlerCancelButton: ButtonHandler = null as unknown as ButtonHandler;
	protected handlerResetButton: ButtonHandler = null as unknown as ButtonHandler;
	protected handlerSaveButton: ButtonHandler = null as unknown as ButtonHandler;
	protected handlerDropdownDecimalDigits: SingleDropdownHandler<string> = null as unknown as SingleDropdownHandler<string>;
	protected handlerDropdownPercentDigits: SingleDropdownHandler<string> = null as unknown as SingleDropdownHandler<string>;
	protected handlerDropdownBpsDigits: SingleDropdownHandler<string> = null as unknown as SingleDropdownHandler<string>;
	protected handlerDropdownDecimalCurrencyValue: SingleDropdownHandler<string> = null as unknown as SingleDropdownHandler<string>;
	protected handlerNumberFormatList: ParentHandler<ToggleButtonExpectations<NumberFormat>> = null as unknown as ParentHandler<ToggleButtonExpectations<NumberFormat>>;

	protected readonly numberList: string[] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
	protected readonly themeList = ['Light', 'Dark', 'System'];
	protected readonly numberFormatList: NumberFormat[] = numberFormatValues;

	public clearBanner(): void {
		this.handlerBanner.title = undefined;
		this.handlerBanner.content = undefined;
	}

	protected created(): void {
		this.settings = new WealthWorkspaceSettingDTO(Object.assign({}, { theme: 'Light' } as IWealthWorkspaceSetting, currentUser.settings));
		this.applyTheme();


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

		this.handlerEmailTextField = {
			value: ToOptionString(currentUser.emails[0]),
			required: true,
			readonly: true,
			placeholder: plugins.lang.t('USER_SETTINGS_PANEL.PROFILE.EMAIL_PLACEHOLDER').toString(),
		};

		this.handlerThemeList = createOneWayBinding<ToggleButtonExpectations<string>>()
			.byRef('values', () => this.themeList)
			.byRef('options', () => {
				return {
					label: v => v,
					selected: value => this.settings?.theme === value
				};
			})
			.byRef('disabled', () => false)
			.on('onClick', val => this.themeOptionClicked(val))
			.create();


		this.handlerDropdownDecimalDigits = {
			value: ToOptionString(this.settings?.decimalDigits),
			cleaneable: false,
			list: this.numberList,
			options: (): SingleDropdownOptions<string> => {
				return {
					type: 'string'
				};
			},
			onChange: str => {
				this.handlerDropdownDecimalDigits.value = str.or(this.handlerDropdownDecimalDigits.value);
				if (str.some && this.settings?.decimalDigits) {
					fsDecimalDigitsChanged(str.value);
					this.settings.decimalDigits = str.value;
				}
			},
			onInput: str => {
				this.handlerDropdownDecimalDigits.value = str.or(this.handlerDropdownDecimalDigits.value);
				if (str.some && this.settings?.decimalDigits) {
					this.settings.decimalDigits = str.value;
				}
			}
		};

		this.handlerDropdownPercentDigits = {
			value: ToOptionString(this.settings?.percentDigits),
			cleaneable: false,
			list: this.numberList,
			options: (): SingleDropdownOptions<string> => {
				return {
					type: 'string'
				};
			},
			onChange: str => {
				this.handlerDropdownPercentDigits.value = str.or(this.handlerDropdownPercentDigits.value);
				if (str.some && this.settings?.percentDigits) {
					fsPercentDigitsChanged(str.value);
					this.settings.percentDigits = str.value;
				}
			},
			onInput: str => {
				this.handlerDropdownPercentDigits.value = str;
			}
		};

		this.handlerDropdownBpsDigits = {
			value: ToOptionString(this.settings?.bpsDigits),
			cleaneable: false,
			list: this.numberList,
			options: (): SingleDropdownOptions<string> => {
				return {
					type: 'string'
				};
			},
			onChange: str => {
				this.handlerDropdownBpsDigits.value = str.or(this.handlerDropdownBpsDigits.value);
				if (str.some && this.settings?.bpsDigits) {
					fsBpsDigitsChanged(str.value);
					this.settings.bpsDigits = str.value;
				}
			},
			onInput: str => {
				this.handlerDropdownBpsDigits.value = str;
			}
		};

		this.handlerDropdownDecimalCurrencyValue = {
			value: ToOptionString(this.settings?.decimalCurrencyValue),
			cleaneable: false,
			list: this.numberList,
			options: (): SingleDropdownOptions<string> => {
				return {
					type: 'string'
				};
			},
			onChange: str => {
				this.handlerDropdownDecimalCurrencyValue.value = str.or(this.handlerDropdownDecimalCurrencyValue.value);
				if (str.some && this.settings?.decimalCurrencyValue) {
					fsDecimalCurrencyChanged(str.value);
					this.settings.decimalCurrencyValue = str.value;
				}
			},
			onInput: str => {
				this.handlerDropdownDecimalCurrencyValue.value = str;
			}
		};

		this.handlerNumberFormatList = createOneWayBinding<ToggleButtonExpectations<NumberFormat>>()
		.byRef('values', () => this.numberFormatList)
		.byRef('options', () => {
			return {
				label: v => v.description,
				selected: value => this.settings?.numberFormatValue?.culture === value.culture
			};
		})
		.byRef('disabled', () => false)
		.on('onClick', val => this.numberFormatToggleClicked(val))
		.create();

		this.handlerCancelButton = {
			title: plugins.lang.t('CANCEL').toString(),
			disabled: false,
			onClick: this.onClose
		};

		/** need design review: location/style of this button, intended audience, and shall we show confirmation etc. */
		this.handlerResetButton = {
			title: plugins.lang.t('RESET').toString(),
			disabled: false,
			onClick: this.onReset
		};

		this.handlerSaveButton = {
			title: plugins.lang.t('SAVE').toString(),
			disabled: false,
			onClick: this.onSave
		};
	}

	protected onClose(): void {
		fsUserSettingsClosed();
		if (this.settings?.isPropertyDirty('theme')) {
			this.settings.revert();
			this.applyTheme();
		}
		this.emit('close');
	}

	protected onReset(): void {
		fsUserSettingsReset();
		this.emit('reset');
	}

	protected onSave(): void {
		if (this.settings?.isDirty) {
			fsUserSettingsSaved();
			currentUser.settings = Object.assign({}, this.settings);
			currentUser.settings.workspaceSetting = undefined as unknown as IWealthWorkspaceSetting;
			currentUser.settings.unique = undefined as unknown as string;
			this.emit('save');
		} else {
			this.emit('close');
		}
	}

	protected numberFormatToggleClicked(numberFormat: NumberFormat): void {
		if (this.settings) {
			fsNumberFormatChanged(numberFormat);
			this.settings.numberFormatValue = numberFormat;
		}
	}

	protected themeOptionClicked(theme: string): void {
		if (this.settings) {
			fsThemeChanged(theme);
			this.settings.theme = theme;
			this.applyTheme();
		}
	}

	private applyTheme(): void {
		if (this.settings && this.settings.theme === 'Dark') {
			changeTheme('dark');
		} else if (this.settings && this.settings.theme === 'Light') {
			changeTheme('light');
		} else {
			changeTheme('system');
		}
	}

	private emit(ev: UserSettingsMenuItemState): void {
		this.$emit(ev);
	}

}

export function createUserMenuSettingsPanel({ parent, elm }: CreateUserSettingsPanelOptions): Promise<UserSettingsMenuItemState> {

	const settingsPanel = compile<UserMenuSettingsPanel>({
		component: UserMenuSettingsPanel,
		parent
	});
	settingsPanel.$mount();
	elm.appendChild(settingsPanel.$el);
	return new Promise(resolve => {
		const on = (ev: UserSettingsMenuItemState) => {
			settingsPanel.on(ev, () => {
				settingsPanel.destroy();
				resolve(ev);
			});
		};
		(['close', 'reset', 'save'] as const).forEach(on);
	});
}

export type CreateUserSettingsPanelOptions = {
	parent: Vue;
	elm: HTMLElement;
}


