import Template from './template.vue';
import { Component, Prop, Vue, Inject } from '@axioma/vue';
import type { UserSettingsRegistry } from '@axioma-api/wealth-utils';
import { SupportedUnitAnalytics, getNumberCellRenderParams } from '@axioma/wealth-commons';
export type ScatterPlotTooltipHandler = {
	portfolio?: string,
	id?: string,
	axisX: { name: { key: SupportedUnitAnalytics, value: string }, value: number },
	axisY: { name: { key: SupportedUnitAnalytics, value: string }, value: number },
	axisZ?: { name: { key: SupportedUnitAnalytics, value: string }, value: number }
}
@Component({
	components: {}
})
export class Tooltip extends Vue.extend(Template) {
	@Inject()
	public userSettingsRegistry!: UserSettingsRegistry;
	@Prop({})
	public handler!: ScatterPlotTooltipHandler;

	protected formatNumber(item: { name: { key: SupportedUnitAnalytics }, value: number }): string {
		const formatter = getNumberCellRenderParams(item.name.key);
		return formatter(item.value);
	}
}