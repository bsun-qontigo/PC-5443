import { Component, Vue, Prop, Inject, ParentHandler, createOneWayBinding, createTwoWayBinding, OneWayExpectations, ChildHandler } from '@axioma/vue';
import VueTemplate from './template.vue';
import { AsyncLoader } from '@axioma/components';
import en from './assets/en';
import { plugins } from '@axioma/common';
import { wealthTaskClientRegistry } from '@axioma-api/wealth-task';
import { DateTime } from 'luxon';
import BatchResults, { BatchResultsHandler } from '@axioma-components/wealth-batch-results';
import { Option, Deferred } from '@axioma/core';
import ScatterPlot, { WealthScatterChartExpectations } from '@axioma-components/wealth-scatter-chart-wrapper';
import { Tile, TileHandler } from '@axioma-framework/qontum';
import GaugeChart, { GaugeHandler } from '@axioma-components/gauge-chart';
import { negativeData } from './negativeData';
import { DashboardHistogramChartField, WealthExtendedBatchOptimizationEntryOutputRO } from '@axioma/wealth-types';
import { Circle, CircleData, HistogramChartClick, IKeyMetric, keyMetricMapping } from '@axioma/wealth-commons';
import { HistogramChartWidget, WealthHistogramChartExpectations } from '@axioma-components/wealth-histogram-chart-wrapper';
import { getFigmaToken } from '@axioma/style-tokens';
import { BatchAnalyticsRO, BatchOptimizationEntryOutputRO } from '@axioma/wealth-models';

plugins.lang.mergeLocaleMessage('en', en);

export type DashboardHandler = OneWayExpectations<{
	strategyName: string;
	date: Option<DateTime>;
	ready: Deferred<void>;
	rootElm: HTMLElement;
	selected: string[];
}, {
	setSelected: (ptfs: string[]) => void;
	onOpenDownloadPanel: () => void;
}>;

@Component({
	name: 'wealth-dashboard-component',
	packageName: '@axioma-components/wealth-dashboard',
	components: {
		AsyncLoader,
		BatchResults,
		ScatterPlot,
		Tile,
		GaugeChart,
		HistogramChartWidget
	}
})
export default class Dashboard extends Vue.extend(VueTemplate) {

	@Prop({
		type: Object,
		required: true
	})
	protected handler!: ChildHandler<DashboardHandler>;

	@Inject('openApp')
	protected openApp!: (id: string, name: string, state?: Record<string, unknown>) => void;

	protected loading = true;
	protected batchResultsHandler!: ParentHandler<BatchResultsHandler>;
	protected scatterChartExpectations!: ParentHandler<WealthScatterChartExpectations>;
	protected wealthLensHandler!: ParentHandler<GaugeHandler>;
	protected batchResult: WealthExtendedBatchOptimizationEntryOutputRO[] = [];
	protected rightPanelStyle: Record<string, string> = { height: '0', overflowX: 'hidden' };
	protected keyMetrics!: Array<IKeyMetric>;
	protected chartWidth = 460;
	protected chartHeight = 366;
	protected procStatusHandler!: TileHandler;
	protected negativeData: CircleData[] = negativeData;
	protected trackingErrorExpectations!: ParentHandler<WealthHistogramChartExpectations<IAccountTrackingError>>;
	protected realizedGainsExpectations!: ParentHandler<WealthHistogramChartExpectations<IAccountRealizedGains>>;
	protected turnoverExpectations!: ParentHandler<WealthHistogramChartExpectations<IAccountTurnover>>;

	protected get trackingError(): IAccountTrackingError[] {
		return this.batchResult.map(v => ({
			accountName: v.accountName,
			trackingError: v.analytics?.trackingError
		}));
	}

	protected get realizedGains(): IAccountRealizedGains[] {
		return this.batchResult.map(v => ({
			accountName: v.accountName,
			realizedGainsYTD: v.analytics?.realizedGainsYTD
		}));
	}

	protected get turnover(): IAccountTurnover[] {
		return this.batchResult.map(v => ({
			accountName: v.accountName,
			turnoverPercent: v.analytics?.turnoverPercent
		}));
	}

	protected openProcessingStatus(): void {
		const { strategyName, date } = this.handler;
		this.openApp('@axioma-apps/wealth-processing-status', this.$t('PROCESSING_STATUS'), { strategyName: strategyName(), date: date() });
	}

	protected created(): void {
		this.createWealthLensHandler();
		this.createBatchResultsHandler();
		this.createScatterChartExpectations();
		this.createProcStatusHandler();
		this.createKeyMetricsHandler();
		this.createHistogramChartHandlers();
	}

	protected mounted(): void {
		this.setSpaces();
		this.handler.ready().promise.then(() => {
			const { strategyName, date } = this.handler;
			if (strategyName && date().some) {
				this.handler.strategyName = strategyName;
				this.handler.date = date;
				this.scatterChartExpectations.strategyName = strategyName;
				this.scatterChartExpectations.date = date;
				this.getResultsAndUpdate(strategyName(), date());
			}
		});
	}

	protected getResultsAndUpdate(stratName: string, date: Option<DateTime>): void {
		if (Option.isSome(date)) {
			this.loading = true;
			wealthTaskClientRegistry.getResultsByStrategyNameAndDate(stratName, date.value)
				.then(result => {
					this.loading = false;
					this.batchResult = result;
					this.updateProcStatusHandler();
					this.updateKeyMetricsHandler();
				});
		}
	}

	protected createProcStatusHandler(): void {
		this.procStatusHandler = Vue.observable({
			icon: 'fa-arrow-up-right-from-square',
			title: this.$t('PROCESSING_STATUS_ERRORS').toString(),
			value: ``,
			onClick: () => this.openProcessingStatus()
		});
	}

	protected createKeyMetricsHandler(): void {
		const keyMetricClicked = this.keyMetricClicked;
		const clickHandler = function (this: IKeyMetric) {
			keyMetricClicked(this);
		};
		const tileIcon = 'fa-suitcase';
		this.keyMetrics = Vue.observable([
			{
				key: 'newAccounts',
				icon: tileIcon,
				title: this.$t('NEW_ACCOUNTS').toString(),
				value: ``,
				onClick: clickHandler
			},
			{
				key: 'cashRaise',
				icon: tileIcon,
				title: this.$t('CASH_RAISE').toString(),
				value: ``,
				onClick: clickHandler
			},
			{
				key: 'cashDeficit',
				icon: tileIcon,
				title: this.$t('CASH_DEFICIT').toString(),
				value: ``,
				onClick: clickHandler
			},
			{
				key: 'compliance',
				icon: tileIcon,
				title: this.$t('COMPLIANCE').toString(),
				value: ``,
				onClick: clickHandler
			}
		]);
	}

	protected createHistogramChartHandlers(): void {
		const histogramClicked = (field: DashboardHistogramChartField, d: unknown): void => {
			const _d = d as d3.Bin<unknown, number>;
			this.histogramClicked({
				field,
				range: [_d.x0 ?? 0, _d.x1 ?? 0],
				operation: 'replace'
			});
		};
		this.trackingErrorExpectations = createOneWayBinding<WealthHistogramChartExpectations<IAccountTrackingError>>()
			.byRef('loading', () => true)
			.byRef('analytic', () => 'trackingError')
			.byRef('date', this.handler.date)
			.byRef('data', () => Promise.resolve(this.trackingError))
			.byRef('valueGetter', () => e => e.trackingError as number)
			.byRef('chartOptions', () => ({
				title: () => 'Tracking Error',
				color: () => getFigmaToken('color-charting-solid-core-5'),
				xAxis: {
					label: () => 'Tracking Error'
				},
				yAxis: {
					label: () => 'Portfolios'
				}
			}))
			.on('clicked', histogramClicked.bind(this, 'trackingError'))
			.create();
		this.realizedGainsExpectations = createOneWayBinding<WealthHistogramChartExpectations<IAccountRealizedGains>>()
			.byRef('loading', () => true)
			.byRef('analytic', () => 'realizedGainsYTD')
			.byRef('date', this.handler.date)
			.byRef('data', () => Promise.resolve(this.realizedGains))
			.byRef('valueGetter', () => e => e.realizedGainsYTD as number)
			.byRef('chartOptions', () => ({
				title: () => 'Realized Gains',
				color: () => getFigmaToken('color-charting-solid-complementary-negative-bg-3'),
				xAxis: {
					label: () => 'Realized Gains'
				},
				yAxis: {
					label: () => 'Portfolios'
				}
			}))
			.on('clicked', histogramClicked.bind(this, 'realizedGainsYTD'))
			.create();
		this.turnoverExpectations = createOneWayBinding<WealthHistogramChartExpectations<IAccountTurnover>>()
			.byRef('loading', () => true)
			.byRef('analytic', () => 'turnoverPercent')
			.byRef('date', this.handler.date)
			.byRef('data', () => Promise.resolve(this.turnover))
			.byRef('valueGetter', () => e => e.turnoverPercent as number)
			.byRef('chartOptions', () => ({
				title: () => 'Turnover',
				color: () => getFigmaToken('color-charting-solid-core-6'),
				xAxis: {
					label: () => 'Turnover (%)'
				},
				yAxis: {
					label: () => 'Portfolios'
				}
			}))
			.on('clicked', histogramClicked.bind(this, 'turnoverPercent'))
			.create();
	}


	private keyMetricClicked(metric: IKeyMetric): void {
		this.batchResultsHandler.child.then(batchResult => {
			const clickParam = {
				key: metric.key,
				field: keyMetricMapping({
					'newAccounts': 'newAccount',
					'cashRaise': 'cashFlow',
					'cashDeficit': 'cashFlow',
					'compliance': 'compliance',
				})[metric.key],
			};

			batchResult.keyMetricClick(clickParam);
		});
	}
	private setSpaces(): void {
		const leftPanel = this.$refs.left as HTMLElement;
		this.rightPanelStyle = {
			minWidth: this.chartWidth + 'px',
			maxWidth: '462px',
			maxHeight: leftPanel.clientHeight ? `${leftPanel.clientHeight}px` : 'auto',
			overflowX: 'hidden'
		};
	}


	private openPortfolioTab(d: WealthExtendedBatchOptimizationEntryOutputRO): void {
		this.batchResultsHandler.child.then(batchResults => batchResults.openPortfolioTab(d));
	}

	private wealthLensClicked(_event: PointerEvent, _data: Circle): void {
		//TODO convert circle stuff to a onHighlighter event.
	}

	private createBatchResultsHandler() {
		this.batchResultsHandler = createTwoWayBinding<BatchResultsHandler>()
			.byRef('strategyName', () => this.handler.strategyName())
			.byRef('date', () => this.handler.date())
			.byRef('result', () => this.batchResult)
			.byRef('loading', () => this.loading)
			.byRef('rootElm', () => this.handler.rootElm())
			.byRef('selected', () => this.handler.selected())
			.on('setSelected', this.handler.setSelected)
			.on('openDownloadPanel', this.handler.onOpenDownloadPanel)
			.create();
	}
	private createScatterChartExpectations() {
		this.scatterChartExpectations = createOneWayBinding<WealthScatterChartExpectations>()
			.byRef('date', () => this.handler.date())
			.byRef('strategyName', () => this.handler.strategyName())
			.byRef('result', () => this.batchResult)
			.byRef('selected', () => this.handler.selected())
			.on('setSelected', this.handler.setSelected)
			.on('openPortfolioTab', this.openPortfolioTab)
			.create();
	}
	private createWealthLensHandler() {
		this.wealthLensHandler = createOneWayBinding<GaugeHandler>()
			.byRef('chartOptions', () => { return { chartWidth: this.chartWidth, chartHeight: this.chartHeight, title: this.$t('WEALTH_LENS').toString(), numberOfCircles: 7 }; })
			.byRef('circleData', () => negativeData)
			.on('onLensHighlighter', this.wealthLensClicked)
			.create();
	}

	private histogramClicked(ev: HistogramChartClick): void {
		this.batchResultsHandler.child.then(batchResults => batchResults.histogramChartClick(ev));
	}

	private updateKeyMetricsHandler(): void {
		let newAccounts = 0;
		let cashRaise = 0;
		let cashDeficit = 0;
		let compliances = 0;
		for (const { newAccount, cashFlow, compliance } of this.batchResult) {
			newAccounts += newAccount ? 1 : 0;
			cashRaise += (cashFlow ?? 0) > 0 ? 1 : 0;
			cashDeficit += (cashFlow ?? 0) < 0 ? 1 : 0;
			compliances += compliance ? 1 : 0;
		}
		let idx = 0;
		this.keyMetrics[idx].value = `${newAccounts}`;
		idx++;
		this.keyMetrics[idx].value = `${cashRaise}`;
		idx++;
		this.keyMetrics[idx].value = `${cashDeficit}`;
		idx++;
		this.keyMetrics[idx].value = `${compliances}`;
	}

	private updateProcStatusHandler(): void {
		const value = this.batchResult.reduce((accumulator, result) => accumulator + (result.log?.errors?.length ?? 0), 0);
		this.procStatusHandler.value = `${value}`;
	}

}

type IAccountTrackingError = Pick<BatchOptimizationEntryOutputRO, 'accountName'> & Pick<BatchAnalyticsRO, 'trackingError'> & { color?: string };
type IAccountRealizedGains = Pick<BatchOptimizationEntryOutputRO, 'accountName'> & Pick<BatchAnalyticsRO, 'realizedGainsYTD'> & { color?: string };
type IAccountTurnover = Pick<BatchOptimizationEntryOutputRO, 'accountName'> & Pick<BatchAnalyticsRO, 'turnoverPercent'> & { color?: string };