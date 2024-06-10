import { createTwoWayBinding, WrappedComponent, Component, Vue, Inject, Public, compile, Provide, ParentHandler, createOneWayBinding } from '@axioma/vue';
import Template from './template.vue';
import { Tab, TabExpectations, ButtonIcon, ButtonIconHandler } from '@axioma-framework/qontum';
import { signOut, exportAsExcelMultiple } from '@axioma/wealth-services';
import { Option, Some, Deferred, noop, ToOptionString } from '@axioma/core';
import { wealthTaskClientRegistry } from '@axioma-api/wealth-task';
import Dashboard, { DashboardHandler } from '@axioma-components/wealth-dashboard';
import { TabItem } from '@axioma-framework/layout';
import { DateTime } from 'luxon';
import { userApplicationStateClientRegistry } from '@axioma-api/wealth-user-application-state';
import type { UserSettingsRegistry } from '@axioma-api/wealth-utils';
import WealthDownloadsPanel, { WealthDownloadsPanelHandler, createDownloadsPanel } from '@axioma-components/wealth-downloads-panel';
import { MultipleExcelDownloadRequest, WorksheetRequest } from '@axioma/wealth-types';
import en from './assets/en';
import { plugins } from '@axioma/common';
import BatchResults from '@axioma-components/wealth-batch-results';

plugins.lang.mergeLocaleMessage('en', en);
import { fsLogout, fsStratTabChange } from './utils/fsEvents';

@Component({
	appName: 'Wealth',
	components: {
		Tab,
		Dashboard,
		ButtonIcon
	}
})
export default class Wealth extends Vue.extend(Template) {

	@Provide()
	public userSettingsRegistry: UserSettingsRegistry = userApplicationStateClientRegistry;

	@Public()
	@Inject()
	public homeTab!: TabItem;

	protected runDate?: Option<DateTime>;
	protected strats: string[] = [];
	protected stratsTabs: Record<string, ParentHandler<TabExpectations>> = {};
	protected gaugeChartOptions: { chartWidth: number; chartHeight: number; } | null = null;
	protected selectedStrat = '';
	protected ready: Deferred<void> = new Deferred();
	protected dashboardHandlers!: Record<string, ParentHandler<DashboardHandler>>;
	protected downloadsPanelOpen = false;
	protected downloadsPanel!: WrappedComponent<WealthDownloadsPanel>;
	protected updateDownloadPanel!: () => void;
	protected handlerDownloadButtonIcon: ButtonIconHandler = null as unknown as ButtonIconHandler;

	protected get isMultipleDownload(): boolean {
		return this.strats.length > 1;
	}

	protected created(): void {
		this.handlerDownloadButtonIcon = {
			icon: ToOptionString('fa-arrow-down-to-bracket'),
			title: this.$t('MULTIPLE_EXPORT').toString(),
			onClick: () => _exportAsExcelMultiple(this.runDate, this.strats)
		};

		const loadStrategies = () => {
			return wealthTaskClientRegistry.getUniqueStrategyNames()
				.then(strategyNames => {
					if (strategyNames.date) {
						const date = Some(strategyNames.date);
						this.runDate = date;
						this.strats = strategyNames.strategyNames || [];
						this.selectedStrat = this.strats[0];
						this.dashboardHandlers = this.strats.reduce((acc, cur) => {
							acc[cur] = createOneWayBinding<DashboardHandler>()
								.byRef('date', () => date)
								.byRef('strategyName', () => cur)
								.byRef('ready', () => this.ready)
								.byRef('rootElm', () => this.$refs.root as HTMLElement)
								.owned('selected', [])
								.on('onOpenDownloadPanel', this.openDownloadPanel)
								.on('setSelected', (ptfs: string[]) => acc[cur].setters.selected(ptfs))
								.create();
							return acc;
						}, Object.create(null) as Record<string, ParentHandler<DashboardHandler, 'selected'>>);
						this.generateTabs(this.strats);
					}
				});

		};

		loadStrategies()
			.then(this.ready.resolve)
			.catch(this.ready.reject);
	}

	protected mounted(): void {
		this.ready.promise.then(this.newDashboard);
		this.$el.setAttribute('data-layout-id', this.homeTab.id);
	}

	protected getTabHandler(item: string): ParentHandler<TabExpectations> {
		return this.stratsTabs[item];
	}

	protected onStratChange(strat: string): void {
		fsStratTabChange();
		this.selectedStrat = strat;
		const dashboards = this.$refs.dashboards as HTMLElement;
		const renderedDashboards = dashboards.children;
		let alreadyRendered = false;
		Array.from(renderedDashboards).forEach(d => {
			if (d.getAttribute('data-strategy') === this.selectedStrat) {
				alreadyRendered = true;
				(d as HTMLElement).style.display = '';
			} else {
				(d as HTMLElement).style.display = 'none';
			}
		});
		if (!alreadyRendered) {
			this.newDashboard();
		}
	}

	protected logout(): void {
		fsLogout();
		signOut();
	}

	protected getDashboardHandler(strat: string): ParentHandler<DashboardHandler> {
		return this.dashboardHandlers[strat];
	}

	private closeDownloadPanel(): void {
		this.downloadsPanel.destroy();
		this.downloadsPanelOpen = false;
	}

	private openDownloadPanel(): void {
		const downloadPanelHandler = createTwoWayBinding<WealthDownloadsPanelHandler>()
			.on('onClose', this.closeDownloadPanel)
			.create();
		if (!this.downloadsPanelOpen) {
			this.downloadsPanelOpen = true;
			const elm = this.$refs.downloadsContainer as HTMLElement;
			elm.classList.remove('position-relative');
			this.downloadsPanel = createDownloadsPanel({ elm, parent: this, handler: downloadPanelHandler });
			downloadPanelHandler.child.then(i => {
				this.updateDownloadPanel = i.updateGrid;
			});
		} else {
			this.updateDownloadPanel();
		}
	}

	private generateTabs(strats: string[]): void {
		strats.forEach(i => this.generateTab(i));
	}

	private generateTab(strat: string): void {
		const binding = createOneWayBinding<TabExpectations>()
			.byRef('name', () => strat)
			.byRef('selected', () => strat === this.selectedStrat)
			.byRef('size', () => 'md')
			.byRef('disabled', () => false)
			.byRef('displayClose', () => false)
			.byRef('displayMinimize', () => false)
			.byRef('divider', () => false)
			.byRef('icon', () => undefined)
			.byRef('tooltip', () => undefined)
			.on('onClick', () => this.onStratChange(strat))
			.on('onClose', noop)
			.on('onMinimize', noop)
			.create();
		this.stratsTabs[strat] = binding;
	}

	private newDashboard(): void {
		const div = document.createElement('div');
		const activeDashboard = compile({
			el: div,
			parent: this,
			component: Dashboard,
			propsData: {
				handler: this.getDashboardHandler(this.selectedStrat)
			},
			provide: () => ({
				layoutTabItem: this.homeTab,
				userSettingsRegistry: this.userSettingsRegistry
			})
		});
		activeDashboard.$mount();
		(this.$refs.dashboards as HTMLElement).appendChild(div.firstChild as HTMLElement);
	}
}

async function _exportAsExcelMultiple(runDate: Option<DateTime> | undefined, strats: string[]): Promise<unknown> {
	const date = runDate;
	if (date?.some) {
		const sheetsP: Promise<WorksheetRequest>[] = strats.map(strat => BatchResults.createExportExcelRequest(date.value, strat));
		const sheets = await Promise.all(sheetsP);
		const jsDate = date.value.toJSDate();
		const request: MultipleExcelDownloadRequest = {
			isMultiple: true,
			props: {
				creator: 'Axioma',
				lastModifiedBy: 'Axioma',
				created: jsDate,
				modified: jsDate,
				lastPrinted: jsDate,
			},
			sheets
		};
		return exportAsExcelMultiple(request);
	}
}