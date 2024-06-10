import type { NumberFormat, IWealthWorkspaceSetting } from '@axioma-api/wealth-utils';
import { comparators } from '@axioma/core';

const { compareString } = comparators;
let unique = 0;

export class WealthWorkspaceSettingDTO implements IWealthWorkspaceSetting {
	public readonly unique: string;
	public theme: string;
	public decimalDigits: string;
	public percentDigits: string;
	public bpsDigits: string;
	public decimalCurrencyValue: string;
	public numberFormatValue: NumberFormat;
	public constructor(public workspaceSetting: IWealthWorkspaceSetting) {
		unique++;
		this.unique = `${unique}`;
		this.theme = workspaceSetting.theme || 'Light';
		this.decimalDigits = workspaceSetting.decimalDigits;
		this.percentDigits = workspaceSetting.percentDigits;
		this.bpsDigits = workspaceSetting.bpsDigits;
		this.decimalCurrencyValue = workspaceSetting.decimalCurrencyValue;
		this.numberFormatValue = workspaceSetting.numberFormatValue;
	}

	public get isDirty(): boolean {
		return !(
			compareString(this.theme, this.workspaceSetting.theme) &&
			compareString(this.decimalDigits, this.workspaceSetting.decimalDigits) &&
			compareString(this.percentDigits, this.workspaceSetting.percentDigits) &&
			compareString(this.bpsDigits, this.workspaceSetting.bpsDigits) &&
			compareString(this.decimalCurrencyValue, this.workspaceSetting.decimalCurrencyValue) &&
			compareString(this.numberFormatValue.culture, this.workspaceSetting.numberFormatValue.culture)
		);
	}

	public isPropertyDirty(key: keyof IWealthWorkspaceSetting): boolean {
		switch (key) {
			case 'theme':
				return !compareString(this[key], this.workspaceSetting[key]);
			default:
				return false;
		}
	}

	public revert(): void {
		this.theme = this.workspaceSetting.theme || 'Light';
		this.decimalDigits = this.workspaceSetting.decimalDigits;
		this.percentDigits = this.workspaceSetting.percentDigits;
		this.bpsDigits = this.workspaceSetting.bpsDigits;
		this.decimalCurrencyValue = this.workspaceSetting.decimalCurrencyValue;
		this.numberFormatValue = this.workspaceSetting.numberFormatValue;
	}

	public commit(workspaceSetting: IWealthWorkspaceSetting): void {
		this.workspaceSetting = workspaceSetting;
	}

	public toInterface(): IWealthWorkspaceSetting {
		return {
			theme: this.theme || 'Light',
			decimalDigits: this.decimalDigits,
			percentDigits: this.percentDigits,
			bpsDigits: this.bpsDigits,
			decimalCurrencyValue: this.decimalCurrencyValue,
			numberFormatValue: this.numberFormatValue,
		};
	}

}
