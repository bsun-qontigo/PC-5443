import { ParentHandler, Vue, Component, compile, Prop, WrappedComponent, TwoWayExpectations, ChildHandler } from '@axioma/vue';
import { StandardNotificationHandler, BannerHandler, ButtonIcon, ButtonIconHandler } from '@axioma-framework/qontum';
import VueTemplate from './template.vue';
import { wealthWorkspaceClientRegistry } from '@axioma-api/wealth-workspace';
import { createGrid, gridColumns } from './grid';
import type { GridApi, ColumnApi, GridReadyEvent } from '@axioma-types/grid-wrapper';
import { WealthBatchWorkspaceArchiveFileTaskStatusRO } from '@axioma/wealth-types';
import { GridHelpers } from '@axioma-framework/grid-wrapper';
import { Context } from './grid/type';
import { ToOptionString, notificationsService } from '@axioma/core';
import { plugins } from '@axioma/common';
import en from './assets/en';

plugins.lang.mergeLocaleMessage('en', en);
export type WealthDownloadsPanelHandler = TwoWayExpectations<{}, {
	onClose(): void;
}, {
	updateGrid: () => void;
}>;
@Component({
	name: 'wealth-errors-panel',
	components: {
		ButtonIcon,
	}
})
export default class WealthDownloadsPanel extends Vue.extend(VueTemplate) {
	@Prop()
	public handler!: ChildHandler<WealthDownloadsPanelHandler>;
	protected gridApi!: GridApi<WealthBatchWorkspaceArchiveFileTaskStatusRO>;
	protected columnApi!: ColumnApi;
	protected loading = true;
	protected gridReadyEvent!: Promise<GridReadyEvent<WealthBatchWorkspaceArchiveFileTaskStatusRO>>;
	protected handlerBanner: BannerHandler = null as unknown as BannerHandler;
	protected handlerCloseButtonIcon: ButtonIconHandler = null as unknown as ButtonIconHandler;
	protected handlerRefreshButtonIcon: ButtonIconHandler = null as unknown as ButtonIconHandler;
	protected notificationHandlers: StandardNotificationHandler[] = [];
	protected polling: NodeJS.Timer | null = null;
	protected created(): void {
		this.handler.init(this, {
			updateGrid: this.updateGrid
		});
		this.handlerCloseButtonIcon = {
			icon: ToOptionString('fa-times'),
			title: this.$t('CLOSE'),
			onClick: this.handler.onClose
		};
		this.handlerRefreshButtonIcon = {
			icon: ToOptionString('fa-rotate-right'),
			title: this.$t('REFRESH'),
			onClick: this.updateGrid
		};
	}
	protected mounted(): void {
		this.loadGrid();
	}

	protected updateGrid(): void {
		wealthWorkspaceClientRegistry.getAllArchivesStatus()
			.then(data => {
				this.loading = false;
				this.fillGrid(data);
			})
			.catch(e => notificationsService.notificationsServiceRegistry.notifyHttpErrors(e));
	}

	protected getContext(): Context {
		return {
			cancel: ev => {
				if (ev.value) {
					wealthWorkspaceClientRegistry.cancelDownloadRequest(ev.data.requestId)
						.then(_res => {
							notificationsService.notificationsServiceRegistry.successToast({ title: this.$t('DOWNLOAD_PANEL.CANCEL_SUCCESSFUL') });
						})
						.catch(e => notificationsService.notificationsServiceRegistry.notifyHttpErrors(e));
				}
			},
			download: ev => {
				if (ev.value) {
					wealthWorkspaceClientRegistry.getArchiveStatus(ev.data.requestId)
						.then(
							data => {
								if (data.zipFileBlobLink) {
									const a = document.createElement('a');
									a.href = data.zipFileBlobLink;
									a.download = data.zipFileBlobLink.split('/').pop() as string;
									document.body.appendChild(a);
									a.click();
									document.body.removeChild(a);
								}
							}
						)
						.catch(e => notificationsService.notificationsServiceRegistry.notifyHttpErrors(e));
				}
			}
		};
	}

	protected destroyed(): void {
		this.gridApi.destroy();
		if (this.polling) {
			clearInterval(this.polling);
		}
		this.polling = null;
	}

	private loadGrid(): void {
		this.gridReadyEvent = createGrid(
			this, {
			context: this.getContext(),
			elm: this.$refs.table as HTMLElement
		}
		);
		this.gridReadyEvent.then(e => {
			this.polling = setInterval(this.updateGrid, 10000);
			this.gridApi = e.api;
			this.columnApi = e.columnApi;
			this.gridApi.showLoadingOverlay();
			const context = this.getContext();
			const colDefs = GridHelpers.getColDefsByHandleOptions(gridColumns(context), e);
			this.gridApi.setColumnDefs(colDefs);
			this.fillGrid([]);
			this.updateGrid();
		});
	}

	private fillGrid(data: WealthBatchWorkspaceArchiveFileTaskStatusRO[]): void {
		if (data.length > 0) {
			this.gridApi.hideOverlay();
			this.gridApi.setRowData(data);
		} else {
			this.gridApi.showNoRowsOverlay();
			this.gridApi.setRowData([]);
		}
	}
}

export function createDownloadsPanel({ parent, elm, handler }: CreateDownloadsPanelOptions): WrappedComponent<WealthDownloadsPanel> {
	const downloadPanel = compile<WealthDownloadsPanel>({
		parent,
		component: WealthDownloadsPanel,
		propsData: {
			handler
		}
	});
	downloadPanel.$mount();
	elm.appendChild(downloadPanel.$el);
	return downloadPanel;
}

export type CreateDownloadsPanelOptions = {
	parent: Vue;
	elm: HTMLElement;
	handler: ParentHandler<WealthDownloadsPanelHandler>;
}

