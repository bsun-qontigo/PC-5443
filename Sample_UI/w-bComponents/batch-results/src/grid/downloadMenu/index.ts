import { Component, Vue, Prop } from '@axioma/vue';
import Template from './template.vue';
import { Context } from '../type';
import { fsDownloadCSV, fsDownloadExcel, fsDownloadTradeList, fsDownloadWorkspace } from '../../utils/fsEvents';

@Component({ name: 'download-menu' })
export default class DownloadMenu extends Vue.extend(Template) {

	@Prop()
	protected context!: Context;

	protected onDownloadExcel(): void {
		fsDownloadExcel();
		this.$emit('onDownloadExcel');
	}

	protected onDownloadCsv(): void {
		fsDownloadCSV();
		this.$emit('onDownloadCsv');
	}

	protected onDownloadWorkspace(): void {
		fsDownloadWorkspace();
		this.$emit('onDownloadWorkspace');
	}

	protected onDownloadTradeList(): void {
		fsDownloadTradeList();
		this.$emit('onDownloadTradeList');
	}
}