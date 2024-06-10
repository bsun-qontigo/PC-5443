import { Component, Prop, Vue } from '@axioma/vue';
import Template from './template.vue';
import { DateTime } from 'luxon';
import { utils } from '@axioma/common';
import { SupportedUnitAnalytics, getFormatter } from '@axioma/wealth-commons';

const { getDateTimeWithFormat, LITTLE_ENDIAN_MEDIUM_DATE_FORMAT_TWO_DIGIT_YEAR } = utils.dateUtils;

@Component({
	components: {}
})
export class Tooltip extends Vue.extend(Template) {
	@Prop({})
	public date?: DateTime;

	@Prop({})
	public series!: {value?: number }[];

	@Prop({})
	public axis?: { legend: string, value: number };

	@Prop({ default: true })
	public isTimeSeries!: boolean;

	@Prop({})
	public analytic!: SupportedUnitAnalytics;

	public get getDate(): string {
		if (this.date && this.date.isValid) {
			return this.dateToString(this.date);
		}
		return '';
	}

	public dateToString(date: DateTime): string {
		return getDateTimeWithFormat(date, LITTLE_ENDIAN_MEDIUM_DATE_FORMAT_TWO_DIGIT_YEAR);
	}

	protected getFormat(num: number): string {
		return getFormatter(num, this.analytic, false);
	}
}