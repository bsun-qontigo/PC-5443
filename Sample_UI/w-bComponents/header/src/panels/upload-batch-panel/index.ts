import { Component, Vue, Ref, compile, Inject } from '@axioma/vue';
import PanelComponent from './UploadBatchPanel.vue';
import { Button, ButtonHandler, ButtonIcon, ButtonIconHandler } from '@axioma-framework/qontum';
import { plugins, utils } from '@axioma/common';
import { ToOptionString } from '@axioma/core';
import en from '../../assets/en';
import { createGrid } from './grid';
import { GridApi, ICellRendererParams } from '@axioma-types/grid-wrapper';
import { Context, RowData } from './grid/type';
export { DateTime } from 'luxon';
import { wealthTaskClientRegistry } from '@axioma-api/wealth-task';
import { Ob } from '@axioma/wealth-services';

const { today } = utils.dateUtils;

import { fsFilesUploaded, fsSingleUploadClicked, fsUploadClosed, fsWrongFiletypeUploaded } from '../../utils/fsEvents';
plugins.lang.mergeLocaleMessage('en', en);
enum FileTypeEnum {
	NOT_HANDLED = 'NOT_HANDLED',
	ZIP = 'ZIP',
	CSV = 'CSV'
}

type FileType = 'ZIP' | 'CSV' | 'NOT_HANDLED';

export type DatedFile = {
	file: File,
	date?: Date,
	type: string,
};

let count = 0;

@Component({
	name: 'upload-batch-panel',
	components: {
		Button,
		ButtonIcon,
	}
})
class BatchUploadsPanel extends Vue.extend(PanelComponent) {

	@Inject('openApp')
	protected openApp!: (id: string, name: string, state?: Record<string, unknown>) => void;

	@Ref()
	protected dropZone!: HTMLElement;

	@Ref()
	protected fileUpload!: HTMLInputElement;
	protected handlerCloseButtonIcon: ButtonIconHandler = null as unknown as ButtonIconHandler;
	protected handlerCloseButton: ButtonHandler = null as unknown as ButtonHandler;
	protected handlerBrowseButton: ButtonHandler = null as unknown as ButtonHandler;
	private readonly zipFiles: DatedFile[] = [];
	private readonly csvFiles: DatedFile[] = [];
	private readonly errorFiles: DatedFile[] = [];
	private gridApi!: GridApi<RowData>;
	private isPriceUpload = false;

	protected created(): void {
		this.handlerCloseButtonIcon = {
			icon: ToOptionString('fa-times'),
			title: this.$t('CLOSE'),
			onClick: this.onClose
		};
		this.handlerCloseButton = {
			title: plugins.lang.t('CLOSE'),
			disabled: false,
			onClick: this.onClose
		};
		this.handlerBrowseButton = {
			title: plugins.lang.t('BATCH_IMPORT.BROWSE'),
			icon: 'fa-arrow-up-to-line',
			iconPosition: 'trailing',
			disabled: false,
			onClick: this.openFileUpload
		};
	}

	protected unmounted(): void {
		window.removeEventListener('dragover', this.preventDefaults);
		window.removeEventListener('drop', this.preventDefaults);
	}

	protected mounted(): void {
		window.addEventListener('dragover', this.preventDefaults, false);
		window.addEventListener('drop', this.preventDefaults, false);

		this.dropZone.addEventListener('dragenter', this.preventDefaults, false);
		this.dropZone.addEventListener('dragenter', this.highlight, false);

		this.dropZone.addEventListener('dragover', this.preventDefaults, false);
		this.dropZone.addEventListener('dragover', this.highlight, false);

		this.dropZone.addEventListener('dragleave', this.preventDefaults, false);
		this.dropZone.addEventListener('dragleave', this.unhighlight, false);

		this.dropZone.addEventListener('drop', this.preventDefaults, false);
		this.dropZone.addEventListener('drop', this.unhighlight, false);
		this.dropZone.addEventListener('drop', this.handleDrop, false);

		this.onDestroy(() => {
			this.dropZone.removeEventListener('dragenter', this.preventDefaults, false);
			this.dropZone.removeEventListener('dragenter', this.highlight, false);

			this.dropZone.removeEventListener('dragover', this.preventDefaults, false);
			this.dropZone.removeEventListener('dragover', this.highlight, false);

			this.dropZone.removeEventListener('dragleave', this.preventDefaults, false);
			this.dropZone.removeEventListener('dragleave', this.unhighlight, false);

			this.dropZone.removeEventListener('drop', this.preventDefaults, false);
			this.dropZone.removeEventListener('drop', this.unhighlight, false);
			this.dropZone.removeEventListener('drop', this.handleDrop, false);
		});

		createGrid(
			this, {
			context: this.getContext(),
			elm: this.$refs.table as HTMLElement
		}).then(e => {
			this.gridApi = e.api;
			this.gridApi.hideOverlay();
			this.watchFileChanges();
		});
	}

	protected getContext(): Context {
		return {
			openProcessingStatus: this.openProcessingStatus
		};
	}

	protected openProcessingStatus(params: ICellRendererParams<RowData>): void {
		this.onClose();
		this.openApp('@axioma-apps/wealth-processing-status', this.$t('PROCESSING_STATUS'), { strategyName: '', date: '', batchId: params.data.batchId });
		Ob.setter((params.data.batchId ?? ''));
	}

	protected highlight(ev: DragEvent): void {
		if (ev.dataTransfer?.types.includes('Files')) {
			this.dropZone.classList.add('drop-active');
			ev.dataTransfer.dropEffect = 'move';
		}
	}

	protected unhighlight(_ev: DragEvent): void {
		this.dropZone.classList.remove('drop-active');
	}

	protected handleDrop(ev: DragEvent): void {
		const { items } = ev.dataTransfer ?? {} as DataTransfer;
		if (items) {
			fsFilesUploaded(items.length.toString());
			const files = Array.from(items).filter(item => item.kind === 'file').map(item => item.getAsFile()) as File[];
			this.processFiles(files);
		}
	}

	protected preventDefaults(e: Event): void {
		e.preventDefault();
		e.stopPropagation();
	}

	protected onClose(): void {
		fsUploadClosed();
		this.$emit('close');
	}

	protected openFileUpload(): void {
		fsSingleUploadClicked();
		this.fileUpload.click();
	}

	protected onFileInputChange(): void {
		const { files } = this.fileUpload;
		if (files) {
			fsFilesUploaded(files.length.toString());
			this.processFiles(Array.from(files));
		}
	}

	private processFiles(files: File[]): void {
		this.isPriceUpload = true;
		this.zipFiles.length = 0;
		this.csvFiles.length = 0;
		this.errorFiles.length = 0;
		files.forEach((file, index) => {
			if (file) {
				if (index > 0 || this.fileType(file) !== 'CSV') {
					this.isPriceUpload = false;
				}
			} else {
				this.isPriceUpload = false;
			}
		});
		files.forEach(file => {
			if (file) {
				const type = this.fileType(file);
				this.addFile(type, file);
			}
		});
	}

	private addFile(fileType: string, file: File): void {
		switch (fileType) {
			case 'ZIP':
				this.zipFiles.push({
					file,
					type: FileTypeEnum.ZIP,
					date: new Date()
				});
				break;
			case 'CSV':
				if (this.isPriceUpload) {
					this.csvFiles.push({
						file,
						type: FileTypeEnum.CSV,
						date: new Date()
					});
				} else {
					this.errorFiles.push({
						file,
						type: FileTypeEnum.NOT_HANDLED,
						date: new Date()
					});
				}
				break;
			default:
				this.errorFiles.push({
					file,
					type: FileTypeEnum.NOT_HANDLED,
					date: new Date()
				});
				break;
		}
	}

	private fileType(file: File): FileType {
		const fileType = file.name.split('.').pop()?.toLowerCase();
		if (fileType === 'zip') {
			return FileTypeEnum.ZIP;
		} else if (fileType === 'csv') {
			return FileTypeEnum.CSV;
		} else {
			if (fileType) {
				fsWrongFiletypeUploaded(fileType);
			}
			return FileTypeEnum.NOT_HANDLED;
		}
	}

	private fillGrid(data: RowData[]): void {
		if (data.length > 0) {
			this.gridApi.hideOverlay();
			this.gridApi.setRowData(data);
		} else {
			this.gridApi.showNoRowsOverlay();
			this.gridApi.setRowData([]);
		}
	}

	private watchFileChanges(): void {
		const rowData: RowData[] = [];
		const allZipFiles: DatedFile[] = [];
		const allCsvFiles: DatedFile[] = [];
		const allErrorFiles: DatedFile[] = [];
		const getSizeStr = (f: DatedFile) => `${Math.ceil((f.file.size || 0) / 1024)} KB`;
		const toRowData = (status: RowData['status'], f: DatedFile) => ({
			filename: f.file.name,
			dropDateTime: today(),
			size: getSizeStr(f),
			status: status,
			file: f.file,
			ii: ++count,
		}) as const;
		const updateRowData = (api: () => Promise<unknown>) => (r: RowData): Promise<void> => {
			if (r.status === 'In Progress') {
				r.status = 'Uploading';
				return api().then((v) => {
					r.status = 'Uploaded';
					const response = v as FetchResponse<unknown>;
					const location = response.headers.get('Location') as string;
					const parts = location.match(/\/tasks\/(.*)\/status/);
					if (Array.isArray(parts)) {
						r.batchId = parts[1];
						this.gridApi.setRowData(rowData);
					}
				}).catch(() => {
					r.status = 'Failed';
					this.gridApi.setRowData(rowData);
				});
			} else {
				return Promise.resolve();
			}
		};
		this.$watch(() => this.zipFiles, () => {
			allZipFiles.push(...this.zipFiles);
			rowData.push(...this.zipFiles.map(toRowData.bind(null, 'In Progress')));
			this.fillGrid(rowData);
			rowData.forEach(r => updateRowData(() => wealthTaskClientRegistry.postBatchJobs(r.file))(r));
		});
		this.$watch(() => this.csvFiles, () => {
			allCsvFiles.push(...this.csvFiles);
			rowData.push(...this.csvFiles.map(toRowData.bind(null, 'In Progress')));
			this.fillGrid(rowData);
			wealthTaskClientRegistry.getUniqueStrategyNames().then(({ strategyNames }) => {
				rowData.forEach(r => {
					(strategyNames ?? []).forEach(strat => {
						updateRowData(() => wealthTaskClientRegistry.rerunBatchJobs(strat, r.file))(r);
					});
				});
			});
		});
		this.$watch(() => this.errorFiles, () => {
			allErrorFiles.push(...this.errorFiles);
			rowData.push(...this.errorFiles.map(toRowData.bind(null, 'Wrong Extension')));
			this.fillGrid(rowData);
		});
	}
}

export function createBatchUploadsPanel({ parent, elm }: CreateBatchUploadsPanelOptions): Promise<string> {

	const batchUploadsPanel = compile<BatchUploadsPanel>({
		component: BatchUploadsPanel,
		parent
	});

	batchUploadsPanel.$mount();
	elm.appendChild(batchUploadsPanel.$el);

	return new Promise<string>(resolve => {
		batchUploadsPanel.on('close', () => {
			batchUploadsPanel.destroy();
			resolve('close');
		});
	});
}

export type CreateBatchUploadsPanelOptions = {
	parent: Vue;
	elm: HTMLElement;
}
