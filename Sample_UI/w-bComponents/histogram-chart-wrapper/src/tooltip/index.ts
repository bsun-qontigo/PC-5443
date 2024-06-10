import { Component, Prop, Vue } from '@axioma/vue';
import Template from './template.vue';
import { SupportedUnitAnalytics, getFormatter } from '@axioma/wealth-commons';

@Component({
	components: {
	}
})
export class Tooltip extends Vue.extend(Template) {
	@Prop({ default: 0 })
	public min!: number;

	@Prop({ default: 0 })
	public max!: number;

	@Prop({ default: 0 })
	public count!: number;

	@Prop({})
	public analytic!: SupportedUnitAnalytics;

	protected getFormat(num: number): string {
		return getFormatter(num, this.analytic, false);
	}
}