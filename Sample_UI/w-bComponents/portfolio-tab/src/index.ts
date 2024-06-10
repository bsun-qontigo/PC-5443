import { Component, Vue, Prop, ChildHandler, ParentHandler, OneWayExpectations, compile, createTwoWayBinding, createOneWayBinding } from '@axioma/vue';
import VueTemplate from './template.vue';
import en from './assets/en';
import { plugins, utils } from '@axioma/common';
import { noop } from '@axioma/core';
import { WealthDrivers, WealthDriversPanelExpectations } from '@axioma-components/wealth-drivers-panel';
import { PortfolioTabState, WealthPortfolioDrillDownRO } from '@axioma/wealth-types';
import Top10Holdings, { Top10HoldingsExpectations } from '@axioma-components/wealth-top-10-holdings';
import PortfolioTable, { PortfolioTableExpectations } from '@axioma-components/portfolio-table';
import PortfolioTimeSeriesWidget, { PortfolioTimeSeriesWidgetExpectations } from '@axioma-components/wealth-portfolio-time-series-widget';
import { currentUser } from '@axioma/wealth-services';
import SectorAllocationWidget, { BarExpectation } from '@axioma-components/sector-allocation-chart';
import { getFigmaToken } from '@axioma/style-tokens';
plugins.lang.mergeLocaleMessage('en', en);

export type PortfolioTabExpectations = OneWayExpectations<PortfolioTabState, {}>;

@Component({
	name: 'wealth-portfolio-tab',
	packageName: '@axioma-components/wealth-portfolio-tab',
	components: {
		PortfolioTable,
		PortfolioTimeSeriesWidget
	}
})
export default class PortfolioTabComponent extends Vue.extend(VueTemplate) {
	@Prop({
		type: Object,
		required: true
	})
	protected handler!: ChildHandler<PortfolioTabExpectations>;

	protected portfolioTableExpectations!: ParentHandler<PortfolioTableExpectations>;
	protected portfolioTimeSeriesWidgetExpectations!: ParentHandler<PortfolioTimeSeriesWidgetExpectations>;
	protected portfolioName = '';
	protected marketValue = '';
	protected benchmark = '';
	protected strategy = '';
	protected asOf = '';
	protected created(): void {
		this.createPortfolioTableExpectations();
		this.createPortfolioTimeSeriesChartExpectations();
	}

	protected async update(pf: WealthPortfolioDrillDownRO): Promise<void> {
		const culture = currentUser.settings.numberFormatValue?.culture;
		if (typeof pf.finalReferenceSize === 'number' && pf.assetDetailsFinal) {
			this.marketValue = new Intl.NumberFormat(culture, { style: 'decimal', maximumFractionDigits: 0 }).format(pf.finalReferenceSize);
		}
		this.portfolioName = this.handler.portfolioName();
		this.benchmark = pf.benchmarkName ?? '';
		this.strategy = pf.strategyName ?? this.handler.strategyName() ?? '';
		this.asOf = utils.dateUtils.dateFormatMedium(utils.dateUtils.getDateTimeFromAPI(pf.date ?? this.handler.asOf()));
		(this.$el as HTMLElement).querySelectorAll('.summary-value').forEach(e => {
			e.classList.remove('qontum-skeleton-value-md', 'all-width');
		});
	}

	protected mounted(): void {
		this.mountWealthDriver();
		this.mountTop10Holdings();
		this.mountSectorAllocation();
		this.$watch(this.handler.portfolioData, (r) => {
			if (!this.handler.loading()) {
				r.then(this.update);
			} else {
				this.portfolioName = '';
				this.marketValue = '';
				this.benchmark = '';
				this.strategy = '';
				this.asOf = '';
				(this.$el as HTMLElement).querySelectorAll('.summary-value').forEach(e => {
					e.classList.add('qontum-skeleton-value-md', 'all-width');
				});
			}
		}, { immediate: true });
		const s = getFigmaToken('panel-sizing-sm-width');
		this.$el.querySelector('.left').style.width = `calc(100% - ${s})`;
	}

	private mountWealthDriver(): void {
		const wealthDriversWrapper = this.$refs.wealthDrivers as HTMLElement;
		const wealthDriversHandler: ParentHandler<WealthDriversPanelExpectations> = createTwoWayBinding<WealthDriversPanelExpectations>()
			.byRef('analysisDate', () => undefined)
			.byRef('data', this.handler.rowData)
			.byRef('headerName', () => '')
			.byRef('loading', this.handler.loading)
			.on('onClose', noop)
			.create();
		const wealthDrivers = compile<WealthDrivers>({
			parent: this,
			component: WealthDrivers,
			propsData: {
				handler: wealthDriversHandler
			}
		});
		wealthDrivers.$mount();
		wealthDriversWrapper.appendChild(wealthDrivers.$el);
	}

	private mountSectorAllocation(): void {
		const wealthSectorAllocationWrapper = this.$refs.wealthSectorAllocation as HTMLElement;
		const wealthSectorAllocationHandler: ParentHandler<BarExpectation> = createOneWayBinding<BarExpectation>()
			.byRef('title', () => ({ value: this.$t('SECTOR_ALLOCATION').toString(), tooltipValueGetter: () => this.$t('SECTOR_ALLOCATION_EXPOSURES').toString() }))
			.byRef('showTitle', () => true)
			.byRef('portfolioData', this.handler.portfolioData)
			.byRef('date', () => this.handler.dashboardDate)
			.byRef('loading', this.handler.loading)
			.create();
		const mountSectorAllocation = compile<SectorAllocationWidget>({
			parent: this,
			component: SectorAllocationWidget,
			propsData: {
				handler: wealthSectorAllocationHandler
			}
		});
		mountSectorAllocation.$mount();
		wealthSectorAllocationWrapper.appendChild(mountSectorAllocation.$el);
	}


	private mountTop10Holdings(): void {
		const top10HoldingsWrapper = this.$refs.wealthTop10Holdings as HTMLElement;
		const top10HoldingsExpectations: ParentHandler<Top10HoldingsExpectations> = createOneWayBinding<Top10HoldingsExpectations>()
			.byRef('analysisDate', () => undefined)
			.byRef('dashboardDate', () => this.handler.dashboardDate)
			.byRef('portfolioData', this.handler.portfolioData)
			.byRef('loading', this.handler.loading)
			.create();
		const top10Holdings = compile<Top10Holdings>({
			parent: this,
			component: Top10Holdings,
			propsData: {
				handler: top10HoldingsExpectations
			}
		});
		top10Holdings.$mount();
		top10HoldingsWrapper.appendChild(top10Holdings.$el);
	}

	private createPortfolioTableExpectations() {
		this.portfolioTableExpectations = createOneWayBinding<PortfolioTableExpectations>()
			.owned('rootElm', this.$refs.portfolioTable as HTMLElement)
			.byRef('strategyName', this.handler.strategyName)
			.byRef('dashboardDate', this.handler.dashboardDate)
			.byRef('loading', this.handler.loading)
			.byRef('portfolioData', this.handler.portfolioData)
			.create();
	}

	private createPortfolioTimeSeriesChartExpectations() {
		this.portfolioTimeSeriesWidgetExpectations = createOneWayBinding<PortfolioTimeSeriesWidgetExpectations>()
			.byRef('loading', this.handler.loading)
			.byRef('dashboardDate', this.handler.dashboardDate)
			.byRef('portfolioData', this.handler.portfolioData)
			.byRef('strategyName', this.handler.strategyName)
			.create();
	}

}
