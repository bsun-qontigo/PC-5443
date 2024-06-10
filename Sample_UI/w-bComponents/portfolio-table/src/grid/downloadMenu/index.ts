import { Component, Vue } from '@axioma/vue';
import Template from './template.vue';
import { fsCSVDownload, fsDownloadWorkspace, fsMultipleDownload, fsSingleDownload } from '../../utils/fsEvents';

@Component({ name: 'download-menu' })
export default class DownloadMenu extends Vue.extend(Template) {

	protected onDownloadExcel(): void {
		fsSingleDownload();
		this.$emit('onDownloadExcel');
	}

	protected onMultipleDownloadExcel(): void {
		fsMultipleDownload();
		this.$emit('onMultipleDownloadExcel');
	}

	protected onDownloadCsv(): void {
		fsCSVDownload();
		this.$emit('onDownloadCsv');
	}

	protected onDownloadWorkspace(): void {
		fsDownloadWorkspace();
		this.$emit('onDownloadWorkspace');
	}
}