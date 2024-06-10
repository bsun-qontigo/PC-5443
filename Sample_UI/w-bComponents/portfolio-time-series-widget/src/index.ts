
import { Component, Vue, OneWayExpectations, Prop, ChildHandler, ParentHandler, createTwoWayBinding, createOneWayBinding } from '@axioma/vue';
import VueTemplate from './template.vue';
import { ToggleButton, ToggleButtonExpectations } from '@axioma-framework/qontum';
import { WealthTimeSeriesExpectations, TimeSeriesWidget } from '@axioma-components/wealth-time-series-chart';
import { DateTime } from 'luxon';
import { ChartDateRangeType, ChartDateRangeshort, SupportedUnitAnalytics } from '@axioma/wealth-commons';
import { Option } from '@axioma/core';
import { getFigmaToken } from '@axioma/style-tokens';
import { timeSeriesControllerRegistry } from '@axioma-api/wealth-time-series';
import { WealthAnalyticsTSResult, WealthPortfolioDrillDownRO } from '@axioma/wealth-types';

const positiveColor = getFigmaToken('color-primary-40');
const negativeColor = getFigmaToken('color-denotative-negative-50');

export type PortfolioTimeSeriesWidgetExpectations = OneWayExpectations<{
	loading: boolean;
	dashboardDate: Option<DateTime>;
	portfolioData: Promise<WealthPortfolioDrillDownRO>;
	strategyName: string;
}, {}>;


@Component({
	name: 'wealth-portfolio-time-series-widget',
	packageName: '@axioma-components/portfolio-time-series-widget',
	components: {
		ToggleButton,
		TimeSeriesWidget
	}
})
export default class PortfolioTimeSeriesWidget extends Vue.extend(VueTemplate) {

	@Prop({
		type: Object,
		required: true
	})
	protected handler!: ChildHandler<PortfolioTimeSeriesWidgetExpectations>;
	protected selectedDateRange: ChartDateRangeType = '1w';
	protected toggleButtonExpectations = null as unknown as ParentHandler<ToggleButtonExpectations<ChartDateRangeType>>;
	protected AUMExpectations = null as unknown as ParentHandler<WealthTimeSeriesExpectations>;
	protected trackingErrorExpectations = null as unknown as ParentHandler<WealthTimeSeriesExpectations>;
	protected netTaxGainExpectations = null as unknown as ParentHandler<WealthTimeSeriesExpectations>;
	protected netTaxLossExpectations = null as unknown as ParentHandler<WealthTimeSeriesExpectations>;
	protected loading = true;

	protected mounted(): void {
		this.$watch(this.handler.portfolioData, () => {
			this.getChartData();
		});
	}

	private getChartData(): void {
		this.handler.portfolioData()
			.then(results => {
				if (results && results.strategyName && results.identity) {
					const wantedAnalytics: SupportedUnitAnalytics[] = ['marketValue', 'trackingError', 'realizedGainsYTD', 'unRealizedLossAvailable']; // for if we need all in the futurescatterChartAxis.filter(item => item !== 'cashFlow') 
					timeSeriesControllerRegistry.getTimeSeries(results.strategyName, results.identity,
						{ endDate: DateTime.now(), startDate: DateTime.now().minus({ years: 1 }), analytics: wantedAnalytics })
						.then((ts: WealthAnalyticsTSResult[]) => {
							if (ts.length > 0) {
								this.createToggleButtonHandler();
								this.createAUMExpectations(ts, results);
								this.createTrackingErrorExpectations(ts, results);
								this.createNetTaxGainExpectations(ts, results);
								this.createNetTaxLossExpectations(ts, results);
								this.loading = false;
							}
						});
				}
			});
	}

	private createToggleButtonHandler(): void {
		this.toggleButtonExpectations = createOneWayBinding<ToggleButtonExpectations<ChartDateRangeType>>()
			.byRef('values', () => ChartDateRangeshort as unknown as Array<ChartDateRangeType>)
			.byRef('disabled', () => false)
			.byRef('options', () => {
				return {
					label: value => value,
					selected: (value) => value === this.selectedDateRange,
				};
			})
			.on('onClick', (ev) => this.onChartRangeChange(ev))
			.create();
	}

	private createAUMExpectations(ts: WealthAnalyticsTSResult[], results: WealthPortfolioDrillDownRO): void {
		const series = ts.map(i => {
			return [i.analytics?.marketValue, i.rebalanceDate];
		}) as [number, DateTime][];
		this.AUMExpectations = createTwoWayBinding<WealthTimeSeriesExpectations>()
			.byRef('data', () => { return Promise.resolve({ color: positiveColor, values: series }); })
			.byRef('loading', this.handler.loading)
			.byRef('date', this.handler.dashboardDate)
			.byRef('analytic', () => 'marketValue')
			.byRef('styles', () => {
				return e => e.style.width = `calc(25%)`;
			})
			.owned('drillDownData', results)
			.create();
	}

	private createTrackingErrorExpectations(ts: WealthAnalyticsTSResult[], results: WealthPortfolioDrillDownRO): void {
		const series = ts.map(i => {
			return [i.analytics?.trackingError, i.rebalanceDate];
		}) as [number, DateTime][];
		this.trackingErrorExpectations = createTwoWayBinding<WealthTimeSeriesExpectations>()
			.byRef('data', () => { return Promise.resolve({ color: positiveColor, values: series }); })
			.byRef('loading', this.handler.loading)
			.byRef('date', this.handler.dashboardDate)
			.byRef('analytic', () => 'trackingError')
			.byRef('styles', () => {
				return e => e.style.width = `calc(25%)`;
			})
			.owned('drillDownData', results)
			.create();
	}

	private createNetTaxGainExpectations(ts: WealthAnalyticsTSResult[], results: WealthPortfolioDrillDownRO): void {
		const series = ts.map(i => {
			return [i.analytics?.realizedGainsYTD, i.rebalanceDate];
		}) as [number, DateTime][];
		this.netTaxGainExpectations = createTwoWayBinding<WealthTimeSeriesExpectations>()
			.byRef('data', () => { return Promise.resolve({ color: positiveColor, values: series }); })
			.byRef('loading', this.handler.loading)
			.byRef('date', this.handler.dashboardDate)
			.byRef('analytic', () => 'realizedGainsYTD')
			.byRef('styles', () => {
				return e => e.style.width = `calc(25%)`;
			})
			.owned('drillDownData', results)
			.create();
	}

	private createNetTaxLossExpectations(ts: WealthAnalyticsTSResult[], results: WealthPortfolioDrillDownRO): void {
		const series = ts.map(i => {
			return [i.analytics?.unRealizedLossAvailable, i.rebalanceDate];
		}) as [number, DateTime][];
		this.netTaxLossExpectations = createTwoWayBinding<WealthTimeSeriesExpectations>()
			.byRef('data', () => { return Promise.resolve({ color: negativeColor, values: series }); })
			.byRef('loading', this.handler.loading)
			.byRef('date', this.handler.dashboardDate)
			.byRef('analytic', () => 'unRealizedLossAvailable')
			.byRef('styles', () => {
				return e => e.style.width = `calc(25%)`;
			})
			.owned('drillDownData', results)
			.create();
	}


	private onChartRangeChange(type: ChartDateRangeType): void {
		this.selectedDateRange = type;
		this.AUMExpectations.child.then(i => i.setTimeScale(type));
		this.trackingErrorExpectations.child.then(i => i.setTimeScale(type));
		this.netTaxGainExpectations.child.then(i => i.setTimeScale(type));
		this.netTaxLossExpectations.child.then(i => i.setTimeScale(type));
	}
}
