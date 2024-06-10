import VueTemplate from './Template.vue';
import { ChartData, ChartInstance, ScatterPlotExtras, XAxis, YAxis, chartType, createChart, getChartColors, xyzMinMax } from '@axioma-framework/charts';
import { ChartWidget, ChartWidgetHandler } from '@axioma-framework/qontum';
import { Deferred, cachedValue, Some, Option, noop } from '@axioma/core';
import { Inject, ChildHandler, Component, OneWayExpectations, Prop, Vue, compile } from '@axioma/vue';
import { DateTime } from 'luxon';
import { identity } from 'rxjs';
import { ScatterPlotTooltipHandler, Tooltip } from './tooltip';
import { getFigmaToken } from '@axioma/style-tokens';
import { BatchTranslation } from '@axioma/wealth-services';
import { WealthExtendedBatchOptimizationEntryOutputRO } from '@axioma/wealth-types';
import { UserSettingsRegistry } from '@axioma-api/wealth-utils';
import { SingleDropdown, SingleDropdownHandler } from '@axioma-framework/qontum';
import { TabItem } from '@axioma-framework/layout';
import { BatchAnalyticsROKey, SupportedUnitAnalytics, getFormatter, scatterChartAxis } from '@axioma/wealth-commons';
import { ZoomMode } from '@axioma-types/charts';
import * as d3 from 'd3';

export type ScatterChartAxisChangedEvent = { x: BatchTranslation; y: BatchTranslation };
export type ScatterChartLayoutState = { axis: ScatterChartAxisChangedEvent };
type RenderDataArg = {
    version: number;
    response: PlotData[];
}
type FlattenedBatchOptimizationEntryOutputRO = {
    date?: DateTime;
    status?: string;
    accountName?: string;
    benchmarkName?: string | null;
    strategyName?: string;
    workspaceId?: string;
    holdingsUnit?: string;
    marketValue?: number,
    trackingError?: number,
    trackingErrorDelta?: number,
    realizedGainsYTD?: number,
    realizedGainsYTDPercent?: number,
    realizedNetGainsDelta?: number,
    realizedNetGainsDeltaPercent?: number,
    unRealizedLossAvailable?: number,
    unRealizedLossAvailablePercent?: number,
    deltaNetTaxLossOverTrackingErrorDelta?: number,
    netTaxLossOverTurnoverDelta?: number,
    numeraireCash?: number,
    turnoverPercent?: number
};

export type WealthScatterChartExpectations = OneWayExpectations<{
    strategyName: string;
    date: Option<DateTime>;
    result: WealthExtendedBatchOptimizationEntryOutputRO[];
    selected: string[];
}, {
    setSelected: (ptfs: string[]) => void;
    openPortfolioTab: (rowData: WealthExtendedBatchOptimizationEntryOutputRO) => void;
}>


@Component({
    name: 'wealth-scatter-chart-wrapper',
    packageName: '@axioma-components/wealth-scatter-chart-wrapper',
    components: {
        SingleDropdown,
        ChartWidget
    }
})
export default class ScatterPlot extends Vue.extend(VueTemplate) {
    @Prop()
    public handler!: ChildHandler<WealthScatterChartExpectations>;
    @Inject()
    protected userSettingsRegistry!: UserSettingsRegistry;
    @Inject()
    protected layoutTabItem!: TabItem;
    protected chartWidgetHandler!: ChartWidgetHandler<unknown>;
    protected plotId = `wid-${window.crypto.randomUUID()}`;
    protected _version!: number;
    protected xAxisSelectHandler!: SingleDropdownHandler<{
        key: BatchAnalyticsROKey,
        value: string
    }>;
    protected yAxisSelectHandler!: SingleDropdownHandler<{
        key: BatchAnalyticsROKey,
        value: string
    }>;

    private selectedXAxis = {
        key: 'trackingError' as SupportedUnitAnalytics,
        value: this.$t(BatchTranslation['trackingError']).toString()
    };
    private selectedYAxis = {
        key: 'realizedGainsYTD' as SupportedUnitAnalytics,
        value: this.$t(BatchTranslation['realizedGainsYTD']).toString()
    };
    private chart!: Deferred<{ $el: HTMLElement }>;
    private _chart!: HTMLElement;
    private _plot!: ChartInstance<PlotData[]>;
    private onResetZoom: () => void = noop;
    private onZoomModeChanged: (mode: ZoomMode) => void = noop;

    protected created(): void {
        this.$watch(this.handler.selected, this.selectPlot);
        this.createAxisExpectations();
        this._chart = document.createElement('div');
        this._chart.style.maxHeight = getFigmaToken('sizing-400');
        this._chart.style.minHeight = getFigmaToken('sizing-400');
        this._chart.classList.add('all-height', 'all-width');
        this._version = 0;
        this.chart = new Deferred();
        this.createScatterChart().then(chart => {
            this._plot = chart;

            this._chart.appendChild(this._plot.svg);
            const { width, height } = this._chart.getBoundingClientRect();
            if (!width || !height) {
                return;
            }
            this._plot.setSize(width, height);
        });
        let version = 0;
        this.$watch(this.handler.result, () => {
            const cached = cachedValue(() => {
                const date = this.handler.date();
                return `${date}`;
            }, () => {
                version++;
                this._version = version;
                return this.getSeriesChartData()
                    .then(response => ({ response, version }));
            });
            const ob = new ResizeObserver(([{ contentRect: { width, height } }]) => {
                if (!width || !height) {
                    return;
                }
                this._plot.setSize(width, height);
            });
            ob.observe(this._chart);
            this.onDestroy(() => ob.disconnect());
            this.$watch(cached, prom => prom
                .then(this.renderChart), { immediate: true });
        }, { immediate: true });

        this.chartWidgetHandler = {
            title: '',
            subtitle: '',
            onResetZoom: () => this.onResetZoom(),
            onZoomModeChanged:  (mode) => this.onZoomModeChanged(mode),
            chart: this.chart.promise,
        };

    }

    private createAxisExpectations(): void {
        const translatedAxis = scatterChartAxis
            .map(i => {
                const value = this.$t(BatchTranslation[i as keyof typeof BatchTranslation]).toString();
                return {
                    key: i,
                    value
                };
            });

        const key: string = this.handler.strategyName();
        const state = (this.layoutTabItem.getState<unknown, { scatterChart: ScatterChartLayoutState }>(key) || {}) as { scatterChart: ScatterChartLayoutState };
        const scatterChartState: ScatterChartLayoutState = state.scatterChart || { axis: { x: 'trackingError', y: 'realizedGainsYTD' } };
        this.selectedXAxis = {
            key: scatterChartState.axis.x as SupportedUnitAnalytics,
            value: this.$t(BatchTranslation[scatterChartState.axis.x]).toString()
        };
        this.selectedYAxis = {
            key: scatterChartState.axis.y as SupportedUnitAnalytics,
            value: this.$t(BatchTranslation[scatterChartState.axis.y]).toString()
        };
        this.xAxisSelectHandler = {
            autofocus: false,
            cleaneable: false,
            list: translatedAxis,
            value: Some(this.selectedXAxis),
            options: () => ({
                format: i => i.value,
                key: i => i.key,
                type: 'other'
            }),
            onChange: str => {
                this.selectedXAxis = str.unwrapOr({
                    key: scatterChartState.axis.x as SupportedUnitAnalytics,
                    value: this.$t(BatchTranslation[scatterChartState.axis.x]).toString()
                }) as typeof this.selectedXAxis;
                this.xAxisSelectHandler.value = Some(this.selectedXAxis);
                this.updateChart();
            }
        };
        this.yAxisSelectHandler = {
            autofocus: false,
            cleaneable: false,
            list: translatedAxis,
            value: Some(this.selectedYAxis),
            options: () => ({
                format: i => i.value,
                key: i => i.key,
                type: 'other'
            }),
            onChange: str => {
                this.selectedYAxis = str.unwrapOr({
                    key: scatterChartState.axis.y as SupportedUnitAnalytics,
                    value: this.$t(BatchTranslation[scatterChartState.axis.y]).toString()
                }) as typeof this.selectedYAxis;
                this.yAxisSelectHandler.value = Some(this.selectedYAxis);
                this.updateChart();
            }
        };
    }

    private updateChart(): void {
        const data = this.getSeriesChartData();
        data.then(res => {
            this._plot.setData(res);
        });
    }

    private getSeriesChartData(): Promise<PlotData[]> {
        const results = this.handler.result();
        let reducedData: PlotData[] = [];
        const selectedX = this.xAxisSelectHandler.value.unwrapOr(this.selectedXAxis);
        const selectedY = this.yAxisSelectHandler.value.unwrapOr(this.selectedYAxis);
        if (results && results.length > 0) {
            const flatRes = results.map(this.convertDataForGraph);
            if (flatRes) {
                reducedData = flatRes.reduce((acc: PlotData[], item) => {
                    const xValue = item[selectedX.key as keyof FlattenedBatchOptimizationEntryOutputRO];
                    const yValue = item[selectedY.key as keyof FlattenedBatchOptimizationEntryOutputRO];
                    const id = item['accountName'] as string;

                    if (xValue !== undefined && yValue !== undefined) {
                        acc.push({
                            id,
                            selected: false,
                            x: xValue as number,
                            xName: selectedX.value,
                            y: yValue as number,
                            yName: selectedY.value
                        });
                    }

                    return acc;
                }, []);
            }

        }
        return Promise.resolve(reducedData);

    }

    private convertDataForGraph(obj: WealthExtendedBatchOptimizationEntryOutputRO): FlattenedBatchOptimizationEntryOutputRO {
        return {
            date: obj.date,
            status: obj.status,
            accountName: obj.accountName,
            benchmarkName: obj.benchmarkName,
            strategyName: obj.strategyName,
            workspaceId: obj.workspaceId,
            holdingsUnit: obj.holdingsUnit,
            ...(obj.analytics ?? {}),
        };
    }

    private createScatterChart(): Promise<ChartInstance<PlotData[]>> {
        const getX = (p: PlotData) => p.x;
        const getY = (p: PlotData) => p.y;
        const getZ = () => 6;
        const values = identity;

        return Promise.resolve(createChart<PlotData[], ScatterPlotExtras>({
            updateInfo: (data, info) => {
                const [xDomain, yDomain, zDomain] = xyzMinMax(data, getX, getY, getZ);
                info.xDomain = xDomain;
                info.yDomain = yDomain;
                info.zDomain = zDomain;
            },
            xAxis: XAxis.createNumericAxis({ label: () => this.xAxisSelectHandler.value.unwrapOr(this.selectedXAxis).value, domain: XAxis.domain, tickFormat: (num) => getFormatter(num, this.xAxisSelectHandler.value.unwrapOr(this.selectedXAxis).key as SupportedUnitAnalytics) }),
            yAxis: [YAxis.createNumericAxis({ label: () => this.yAxisSelectHandler.value.unwrapOr(this.selectedYAxis).value, domain: YAxis.domain, tickFormat: (num) => getFormatter(num, this.yAxisSelectHandler.value.unwrapOr(this.selectedYAxis).key as SupportedUnitAnalytics) })],
            tooltip: (_ev, chart) => {
                const tooltip = compile<Tooltip>({
                    parent: this,
                    component: Tooltip,
                    propsData: {}
                });
                tooltip.mount();
                document.body.appendChild(tooltip.$el);
                return {
                    dispose: () => tooltip.$destroy(),
                    parentContains: e => tooltip.$el.contains(e),
                    update: ev => {
                        const scatterPlot = chart.scatterPlot(ev);
                        if (scatterPlot?.isHover()) {
                            tooltip.$el.style.left = `${ev.x}px`;
                            tooltip.$el.style.top = `${ev.y - 8}px`;
                            const dot = this._plot.data[scatterPlot.closest()];
                            const scatterPlotTooltipHandler: ScatterPlotTooltipHandler = {
                                id: dot.id.toString(),
                                axisX: {
                                    name: this.selectedXAxis,
                                    value: dot.x
                                },
                                axisY: {
                                    name: this.selectedYAxis,
                                    value: dot.y
                                }
                            };
                            tooltip.handler = scatterPlotTooltipHandler;
                            tooltip.$el.style.display = '';
                        } else {
                            tooltip.$el.style.display = 'none';
                        }
                    }
                };
            },
            init: [],
            charts: [
                chartType.xGrid(),
                chartType.yGrid(),
                chartType.plot({
                    getX,
                    getY,
                    getZ,
                    values,
                    xDomain: niceDomain(() => XAxis.domain),
                    yDomain: niceDomain(() => YAxis.domain),
                    zDomain: info => info.zDomain,
                    zProportion: false,
                    unique: e => e.id,
                    color: () => getChartColors()[0],
                    border: () => getFigmaToken('color-secondary-1'),
                    click: (ev, data) => {
                        if (!ev.shiftKey) {
                            this.handler.setSelected([data.id]);
                        }
                        const foundData = this.handler.result().find(x => x.accountName === data.id);
                        if (foundData) {
                            const selectedArray = this.handler.selected();
                            selectedArray.push(foundData.accountName as string);
                            this.handler.setSelected(selectedArray);
                        }
                    },
                    dblclick: (_, data) => {
                        const foundData = this.handler.result().find(x => x.accountName === data.id);
                        if (foundData) {
                            this.handler.openPortfolioTab(foundData);
                        }
                    }
                })
            ],
        })
        );

    }
    private renderChart(result: RenderDataArg | null): void {
        this.chart.resolve({ $el: this._chart });
        if (!document.body.contains(this._chart)) {
            requestAnimationFrame(() => {
                this.renderChart(result);
            });
            return;
        }
        if (!result) {
            this._plot.setData([]);
            return;
        }
        this._plot.setData(result.response);
        this.onResetZoom =  this._plot.resetZoom;
        this.onZoomModeChanged = this._plot.setZoomMode;
    }


    private selectPlot(ptf: string[]): void {
        const plot = this._plot.svg;
        const selected = 1;
        const notSelected = 0.2;
        const predicate = (d: PlotData) => Array.from(ptf).includes(d.id);
        if (ptf && ptf.length > 0) {
            d3.select(plot).selectAll<d3.BaseType, PlotData>('circle')
                .attr('opacity', d => {
                    if (predicate(d)) {
                        return selected;
                    } else {
                        return notSelected;
                    }
                });
        } else {
            d3.select(plot).selectAll<d3.BaseType, PlotData>('circle')
                .attr('opacity', () => selected);
        }
    }

}
type PlotData = {
    selected: boolean;
    id: string;
    x: number;
    xName?: string;
    y: number;
    yName?: string;
}

const niceDomain = <T extends ChartData<ScatterPlotExtras>>(domain: () => (typeof XAxis.domain<T>) | (typeof YAxis.domain<T>)) => ((info: T) => {
    const domain_ = domain();
    const [x, y] = domain_(info) as [number, number];
    const d = y - x;
    return [x - 0.1 * d, y + 0.1 * d] as [d3.NumberValue, d3.NumberValue];
});