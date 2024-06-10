export default {
	USER_SETTINGS_PANEL: {
		TITLE: 'User Settings',
		VERSION_LEGEND: 'List versions',
		PROFILE: {
			TITLE: 'Profile',
			EMAIL_LABEL: 'Email',
			EMAIL_PLACEHOLDER: 'Example@qontigo.com',
			CHANGE_PASSWORD: 'Change Password',
			CHECK_ENTITLEMENTS: 'Check Entitlements'
		},
		APPAREANCE: {
			TITLE: 'Appearance',
			LANGUAGE: 'Language',
			THEME: 'Theme'
		},
		PRODUCT_FEATURES: {
			TITLE: 'Product Features',
			PRICING_SOURCE: 'Pricing Source',
			DATA_PARTITION: 'Data Partition',
			SHOW_BENCHMARK_POSITIONS: 'Show Benchmark Positions',
			SHOW_RISK_FACTOR_NAME: 'Show Risk Factor Name',
			REMEMBER_POSITION_DATE: 'Remember Position Date',
			ENABLE_ADVANCED_DIAGNOSTIC: 'Enable Advanced Diagnostic Features',
			COUNTRY_USE_DEFAULT_SORTING: 'Country Use Default Sorting',
			CURRENCY_USE_DEFAULT_SORTING: 'Currency Use Default Sorting',
		},
		NUMBERS: {
			TITLE: 'Numbers',
			DECIMAL_DIGITS: 'Number Decimal Places',
			PERCENT_SIGNIFICANT_DIGITS: '% Decimal Places',
			BPS_SIGNIFICANT_DIGIS: 'Bps Decimal Places',
			DECIMAL_CURRENCY: 'Currency Decimal Places',
			NUMBER_FORMAT: 'Number Format'
		},
		ERRORS: {
			EMAIL_NOT_VALID: 'The Email is not valid'
		}
	},
	CHANGE_PASSWORD_PANEL: {
		TITLE: 'Change Password',
		CHANGE_BUTTON: 'Change',
		PASSWORD: {
			TITLE: 'Password',
			OLD_PASSWORD: 'Old Password',
			NEW_PASSWORD: 'New Password',
			RETYPE_PASSWORD: 'Retype Password'
		},
		NOTIFICATIONS: {
			EMAIL_SAVED: 'Your changes was saved successfully',
			PASSWORD_UPDATED: 'Your password was updated successfully',
			PASSWORD_NOT_UPDATED: 'Your password was not updated'
		},
		ERRORS: {
			401: 'Authentication needed',
			403: 'No permissions',
			NO_ERROR_MESSAGE: 'There is no message for this error, please contact support',
			DEFAULT_ERROR_MESSAGE: 'An error ocurred, please try again',
			PASSWORD_NOT_MATCH_LAST_FIVE: 'Password must not match the last five passwords used',
			OLD_PASSWORD_NOT_CORRECT: 'Old password is not correct.',
			CONTACT_SUPPORT: 'Contact support'
		},
		PASSWORD_REQUIREMENTS: `
			<p class="c1 marg-tb-xs">New password Requirements:</p>
			<p class="marg-bottom-none qontum-text-field-label">* 8–20 characters</p>
			<p class="marg-bottom-none qontum-text-field-label">* A lower-case and an upper-case letter</p>
			<p class="marg-bottom-none qontum-text-field-label">* A character that is not a letter or number</p>
			<p class="c1 marg-tb-xs">Don’t use:</p>
			<p class="marg-bottom-none qontum-text-field-label">* A recent password</p>
			<p class="marg-bottom-none qontum-text-field-label">* Blank spaces</p>
			<p class="marg-bottom-none qontum-text-field-label">* Your user name</p>
			<p class="marg-bottom-none qontum-text-field-label">* Obvious words like Axioma or password</p>`,
	},
	USER_ENTITLEMENTS: {
		TITLE: 'User Entitlements'
	},
	VERSION_SELECTOR: {
		TITLE: 'Versions',
		DESCRIPTION: 'Disclaimer: this is an experimental feature. You can find more info',
		HERE: 'here',
		CURRENT: 'Current',
		TOKEN: 'Token',
		CLEAR_DESCRIPTION: 'Remove the current selected version (if any), once clicked just refresh (F5) for the changes to be seen',
	}
};