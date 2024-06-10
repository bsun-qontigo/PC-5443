import { Component, Vue, Prop, WrappedComponent, OneWayExpectations, ChildHandler } from '@axioma/vue';
import VueTemplate from './template.vue';
import { AsyncLoader } from '@axioma/components';
import en from './assets/en';
import { plugins } from '@axioma/common';
import { TextField } from '@axioma-framework/components';
import { GridApi, GridReadyEvent } from '@axioma-types/grid-wrapper';
import { createGrid } from './grid/status';
import { wealthTaskClientRegistry } from '@axioma-api/wealth-task';
import { Context } from './type';
import { DateTime } from 'luxon';
import { WealthBatchJobRO } from '@axioma/wealth-types';
import { createErrorsPanel, IWealthErrorsPanel } from '@axioma-components/wealth-errors-panel';
import { noop, Debouncer } from '@axioma/core';
import { StandardNotificationHandler } from '@axioma-framework/qontum';
import { Ob } from '@axioma/wealth-services';
import { fsCloseErrors, fsShowErrors } from './utils/fsEvents';

plugins.lang.mergeLocaleMessage('en', en);

export type ProcessingStatusHandler = OneWayExpectations<{
	date: DateTime | null;
	strategyName?: string;
}, {}>

@Component({
	name: 'wealth-processing-status-component',
	packageName: '@axioma-components/wealth-processing-status',
	components: {
		AsyncLoader,
		TextField
	}
})
export default class ProcessingStatus extends Vue.extend(VueTemplate) {
	@Prop({
		type: Object,
		required: true
	})
	protected handler!: ChildHandler<ProcessingStatusHandler>;

	protected gridApi!: GridApi<WealthBatchJobRO>;
	protected showErrorGrid = false;
	protected batchId = '';
	protected gridReady!: Promise<GridReadyEvent<WealthBatchJobRO>>;
	protected errorPanelOpen = false;
	protected errorsPanel!: WrappedComponent<IWealthErrorsPanel<WealthBatchJobRO>>;
	protected loading = false;
	private loader!: Debouncer;

	protected created(): void {
		this.loader = new Debouncer(150, this.loadData);
		this.$watch(() => this.handler?.date, this.loader.tick);
		this.$watch(() => Ob.watcher(), () => {
			const batchId = Ob.getter();
			if (batchId) {
				this.gridReady.then(() => {
					let isLoaded = false;
					this.gridApi.forEachNode((node) => {
						if (node.data.batchId === batchId) {
							isLoaded = true;
						}
					});
					if (isLoaded) {
						let selectedNode;
						this.gridApi.forEachNode((node) => {
							const isSelected = node.data.batchId === batchId;
							node.setSelected(isSelected);
							if (isSelected) {
								selectedNode = node;
							}
						});
						if (selectedNode) {
							this.gridApi.ensureNodeVisible(selectedNode);
						}
					} else {
						this.loadData();
					}
				});
			}
		});
	}

	protected loadData(): void {
		const date = this.handler?.date();
		if (date) {
			this.loading = true;
			this.fillStatusGrid([]);
			this.gridApi.showLoadingOverlay();
			this.gridReady
				.then(() =>
					wealthTaskClientRegistry.getBatchJobsByDate(date)
						.then(batchJobs => this.fillStatusGrid(batchJobs))
						.catch(() => this.gridApi.hideOverlay())
				)
				.finally(() => this.loading = false);
		}
	}

	protected mounted(): void {
		this.gridReady = createGrid(this, {
			context: this.getContext(),
			elm: this.$refs.status as HTMLElement
		});
		this.gridReady.then(e => {
			this.gridApi = e.api;
			this.fillStatusGrid([]);
		});
		this.onDestroy(() => {
			this.gridApi?.destroy();
		});
		if (Ob.getter()) {
			this.gridReady.then(() => {
				let selectedNode;
				this.gridApi.forEachNode((node) => {
					const isSelected = node.data.batchId === Ob.getter();
					node.setSelected(isSelected);
					if (isSelected) {
						selectedNode = node;
					}
				});
				if (selectedNode) {
					this.gridApi.ensureNodeVisible(selectedNode);
				}
			});
		}
	}
	protected getContext(): Context {
		return {
			gridApi: () => this.gridApi,
			loading: this.loading,
			onRefresh: this.onRefresh,
			showErrors: this.showErrors,
			closeErrorsPanel: this.closeErrorsPanel
		};
	}

	protected onRefresh(): void {
		this.loader.tick();
	}

	protected showErrors(data: WealthBatchJobRO): void {
		fsShowErrors();
		const createNotificationHandlers = (() => {
			if ((data.log?.errors?.length ?? 0) > 0) {
				const errors = data.log?.errors ?? [];
				return errors.map(error => {
					return {
						select: noop,
						timestamp: '' as unknown as DateTime,
						severity: 'error',
						body: error,
						icon: 'fa-regular fa-database',
						title: this.$t('ERROR').toString(),
					};
				});
			} else if (data.numErrors) {
				return wealthTaskClientRegistry.getResultsByBatchId(data.batchId as string).then(results => {
					const errors = results.map(r => (r.log?.errors ?? []).map(e => `${r.accountName}: ${e}`)).flat();
					return errors.map(error => {
						return {
							select: noop,
							timestamp: '' as unknown as DateTime,
							severity: 'error',
							body: error,
							icon: 'fa-regular fa-database',
							title: this.$t('ERROR').toString(),
						};
					});
				});
			} else {
				return [];
			}
		}) as () => (StandardNotificationHandler[] | Promise<StandardNotificationHandler[]>);
		if (this.$parent) {
			const batchName = `${data.batchId}`;
			if (!this.errorPanelOpen) {
				this.errorPanelOpen = true;
				const elm = this.$refs.sidePanelContainer as HTMLElement;
				elm.classList.remove('position-relative');
				this.errorsPanel = createErrorsPanel<WealthBatchJobRO>({ elm, data, createNotificationHandlers, parent: this.$parent, headerName: batchName });
			} else {
				this.errorsPanel.updateWith({
					data,
					createNotificationHandlers,
					headerName: batchName,
				});
			}
			this.errorsPanel.on('close', this.closeErrorsPanel);
		}
	}

	protected closeErrorsPanel(): void {
		fsCloseErrors();
		this.errorsPanel?.destroy();
		this.errorPanelOpen = false;
	}

	private fillStatusGrid(data: WealthBatchJobRO[]): void {
		if (data.length > 0) {
			this.gridApi.hideOverlay();
			this.gridApi.setRowData(data);
			const selectedBatchId = Ob.getter();
			if (selectedBatchId) {
				let selectedNode;
				this.gridApi.forEachNode((node) => {
					const isSelected = node.data.batchId === Ob.getter();
					node.setSelected(isSelected);
					if (isSelected) {
						selectedNode = node;
					}
				});
				if (selectedNode) {
					this.gridApi.ensureNodeVisible(selectedNode);
				}
			}
		} else {
			this.gridApi.showNoRowsOverlay();
			this.gridApi.setRowData([]);
		}
	}
}
