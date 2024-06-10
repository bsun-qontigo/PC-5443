import { Component, Prop, Vue } from '@axioma/vue';
import Template from './template.vue';
import { userApplicationStateClientRegistry } from '@axioma-api/wealth-user-application-state';

@Component({
	components: {}
})
export class Tooltip extends Vue.extend(Template) {
	@Prop({ default: '' })
	public axis!: string;

	@Prop({ default: 0 })
	public value!: number;

	public get getAxis(): string {
		return (this.axis && this.axis.length > 0) ? this.axis : '';
	}

	protected getFormat(num: number): string {
		const fmt = userApplicationStateClientRegistry.getFormatter('percent');
		return fmt(num);
	}
}