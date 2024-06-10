import { Component, Vue, Inject, ParentHandler, createOneWayBinding } from '@axioma/vue';
import { Some, notificationsService, HttpStatusCodes } from '@axioma/core';
import Template from './template.vue';
import PortfolioTab, { PortfolioTabExpectations } from '@axioma-components/wealth-portfolio-tab';
import { TabItem } from '@axioma-framework/layout';
import { portfolioClientRegistry } from '@axioma-api/wealth-drilldown';
import { PortfolioDrilldownState, PortfolioTabState, WealthExtendedBatchOptimizationEntryOutputRO, WealthPortfolioDrillDownRO } from '@axioma/wealth-types';
import { wealthTaskClientRegistry } from '@axioma-api/wealth-task';
import { DateTime } from 'luxon';
import { plugins } from '@axioma/common';
import en from './assets/en';

plugins.lang.mergeLocaleMessage('en', en);

type PortfolioTabLayoutState = Omit<PortfolioTabState, 'dashboardDate'> & { dashboardDate: DateTime; module: string; };

@Component({
	appName: 'Wealth Portfolio Tab',
	components: {
		PortfolioTab
	}
})
export default class WealthPortfolioTab extends Vue.extend(Template) {

	@Inject()
	protected layoutTabItem!: TabItem;
	protected portfolioTabExpectations!: ParentHandler<PortfolioTabExpectations, 'loading' | 'portfolioData' | 'dashboardDate' | 'rowData'>;

	protected created(): void {
		// TODO move this into portfoliotab component
		const prevState = this.layoutTabItem.getState<PortfolioDrilldownState, PortfolioTabLayoutState>('state') ?? {} as PortfolioTabLayoutState;
		const portfolioName = prevState.portfolioName;
		const asOf = prevState.asOf;
		const dashboardDate = Some(prevState.dashboardDate);
		const strategyName = prevState.strategyName;
		this.portfolioTabExpectations = createOneWayBinding<PortfolioTabExpectations>()
			.byRef('portfolioName', () => portfolioName)
			.byRef('strategyName', () => strategyName)
			.byRef('asOf', () => asOf)
			.owned('dashboardDate', dashboardDate)
			.owned('portfolioData', Promise.resolve({} as WealthPortfolioDrillDownRO))
			.owned('rowData', {} as WealthExtendedBatchOptimizationEntryOutputRO)
			.owned('loading', true)
			.create();
		if (strategyName && portfolioName) {
			this.fetchLatestDateAndDrilldownData(strategyName, portfolioName)
				.then(response => {
					const { latestDate, latestDrilldown } = response;
					// ensure loading goes before portfolioData;
					this.portfolioTabExpectations.setters.dashboardDate(Some(latestDate as DateTime));
					this.portfolioTabExpectations.setters.portfolioData(Promise.resolve(latestDrilldown as WealthPortfolioDrillDownRO));
					const { healthScore, subscores, maxSubscoreName } = latestDrilldown as WealthPortfolioDrillDownRO;
					const rowData = { analytics: { healthScore, subscores, maxSubscoreName } } as WealthExtendedBatchOptimizationEntryOutputRO;
					this.portfolioTabExpectations.setters.rowData(rowData);
					this.portfolioTabExpectations.setters.loading(false);
					this.layoutTabItem.setState('state', { ...prevState, dashboardDate: latestDate, rowData: {} });
				}).catch(() => {
					// TODO do we need to show previous results?
					this.portfolioTabExpectations.setters.dashboardDate(dashboardDate);
					this.portfolioTabExpectations.setters.portfolioData(Promise.resolve({} as WealthPortfolioDrillDownRO));
					this.portfolioTabExpectations.setters.rowData({} as WealthExtendedBatchOptimizationEntryOutputRO);
					this.portfolioTabExpectations.setters.loading(false);
				});
		} 
	}

	private fetchLatestDateAndDrilldownData(strategyName: string, portfolioName: string): Promise<{ latestDate: DateTime | undefined; latestDrilldown: WealthPortfolioDrillDownRO | undefined }> {
		return wealthTaskClientRegistry.getUniqueStrategyNames().then(r => {
			const latestDate = r.date;
			if (!latestDate) {
				// TODO UX;
				return { latestDate: latestDate as unknown as DateTime, latestDrilldown: undefined };
			}
			return portfolioClientRegistry.getDrilldown(latestDate, strategyName, portfolioName)
				.then(latestDrilldown => {
					return {
						latestDate,
						latestDrilldown
					};
				}).catch(response => {
					if (response.status === HttpStatusCodes.BAD_REQUEST) {
						notificationsService.notificationsServiceRegistry.danger({ title: this.$t('ISSUE_LOADING_DATA').toString(), body: this.$t('GET400').toString() });
					} else {
						notificationsService.notificationsServiceRegistry.danger({ title: this.$t('ISSUE_LOADING_DATA').toString(), body: JSON.stringify(response) });
					}
					return {
						latestDate,
						latestDrilldown: undefined
					};
				});
		});
	}
}