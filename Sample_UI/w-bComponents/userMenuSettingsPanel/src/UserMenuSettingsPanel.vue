<template lang="pug">
.qontum-panel.size-sm.user-settings-panel
	.title
		.display-flex-column.all-width
			.display-flex.justify-content-space-between.align-items-center.all-width.marg-bottom-xs
				.qontum-panel-title {{ $t('USER_SETTINGS_PANEL.TITLE') }}
				ButtonIcon.tertiary(:handler='handlerCloseButtonIcon')
			.display-flex
				Banner.all-width(v-if='handlerBanner.title', :handler='handlerBanner')
	.body
		.display-flex-column.marg-bottom-s
			h2.qontum-panel-subtitle {{ $t('USER_SETTINGS_PANEL.PROFILE.TITLE') }}
			hr.qontum-divider.secondary.marg-tb-xs
			.display-flex.marg-bottom-xs
				.email-label.qf-email-label.qontum-label.align-self-center.flex-basis-15 {{ $t('USER_SETTINGS_PANEL.PROFILE.EMAIL_LABEL') }}
				Textfield.email-input.qf-email-input.flex-basis-85(:handler='handlerEmailTextField')
		.display-flex-column.marg-bottom-s.settings-theme-selector
			h2.qontum-panel-subtitle {{ $t('USER_SETTINGS_PANEL.APPAREANCE.TITLE') }}
			hr.qontum-divider.secondary.marg-tb-xs
			.display-flex.marg-tb-xxs
				.theme-label.qf-theme-label.qontum-label.align-self-center.flex-basis-15 {{ $t('USER_SETTINGS_PANEL.APPAREANCE.THEME') }}
				ToggleButton.theme-selector.qf-theme-selector(:handler='handlerThemeList')
		.display-flex-column.marg-bottom-s
			h2.qontum-panel-subtitle {{ $t('USER_SETTINGS_PANEL.PRODUCT_FEATURES.TITLE') }}
			hr.qontum-divider.secondary.marg-tb-xs
		.display-flex-column.marg-bottom-m
			.display-flex.marg-tb-xxs.number-decimal-places
				.number-decimal-places-label.qf-number-decimal-places-label.qontum-label.align-self-center.flex-basis-40 {{ $t("USER_SETTINGS_PANEL.NUMBERS.DECIMAL_DIGITS") }}
				SingleDropdown.number-decimal-places-selector.qf-number-decimal-places-selector.flex-basis-15(:handler='handlerDropdownDecimalDigits')
				.number-decimal-places-example.qf-number-decimal-places-example.qontum-label.align-self-center.flex-basis-40.padd-left-m {{ decimalPlacesExample }}
			.display-flex.marg-tb-xxs.percent-decimal-places
				.percent-decimal-places-label.qf-percent-decimal-places-label.qontum-label.align-self-center.flex-basis-40 {{ $t("USER_SETTINGS_PANEL.NUMBERS.PERCENT_SIGNIFICANT_DIGITS") }}
				SingleDropdown.percent-decimal-places-selector.qf-percent-decimal-places-selector.flex-basis-15(:handler='handlerDropdownPercentDigits')
				.percent-decimal-places-example.qf-percent-decimal-places-example.qontum-label.align-self-center.flex-basis-40.padd-left-m {{ percentDigitsExample }}
			.display-flex.marg-tb-xxs.bps-decimal-places(v-if='false')
				.bps-decimal-places-label.qf-bps-decimal-places-label.qontum-label.align-self-center.flex-basis-40 {{ $t("USER_SETTINGS_PANEL.NUMBERS.BPS_SIGNIFICANT_DIGIS") }}
				SingleDropdown.bps-decimal-places-selector.qf-bps-decimal-places-selector.bps-decimal-places-selector.qf-bps-decimal-places-selector.flex-basis-15(:handler='handlerDropdownBpsDigits')
				.bps-decimal-places-example.qf-bps-decimal-places-example.qontum-label.align-self-center.flex-basis-40.padd-left-m {{ bpsDigitsExample }}
			.display-flex.marg-tb-xxs.currency-decimal-places
				.currency-decimal-places-label.qf-currency-decimal-places-label.qontum-label.align-self-center.flex-basis-40 {{ $t("USER_SETTINGS_PANEL.NUMBERS.DECIMAL_CURRENCY") }}
				SingleDropdown.currency-decimal-places-selector.qf-currency-decimal-places-selector.flex-basis-15(:handler='handlerDropdownDecimalCurrencyValue')
				.currency-decimal-places-example.qf-currency-decimal-places-example.qontum-label.align-self-center.flex-basis-40.padd-left-m {{ decimalCurrencyExample }}
			.display-flex.marg-tb-xxs.number-formatter-toggle
				.number-format-label.qf-number-format-label.qontum-label.align-self-center.flex-basis-40 {{ $t("USER_SETTINGS_PANEL.NUMBERS.NUMBER_FORMAT") }}
				ToggleButton.number-format-selector.qf-number-format-selector(:handler='handlerNumberFormatList')
	.footer
		.display-flex-column.all-width
			hr.qontum-divider.secondary.marg-tb-xs
			.display-flex.justify-content-space-between
				.qontum-label.align-self-center.display-flex.all-width
				.display-flex
					Button.cancel.qf-cancel.secondary.size-md.marg-right-xs(:handler='handlerCancelButton')
					Button.reset.qf-reset.secondary.size-md.marg-right-xs(:handler='handlerResetButton')
					Button.save.qf-save.primary.size-md(:handler='handlerSaveButton')
</template>