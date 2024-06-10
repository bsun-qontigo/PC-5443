import { ChildHandler, Component, CreateElement, TwoWayExpectations, Prop, VNode, Vue, compile } from '@axioma/vue';
import VueTemplate from './template.vue';
import { DateTime } from 'luxon';
import { Deferred, cachedValue, Option } from '@axioma/core';
import { BaseExtras, ChartInstance, XAxis, YAxis, chartType, createChart, xyMinMaxDeep, chartDateRange } from '@axioma-framework/charts';
import { ChartWidget, ChartWidgetHandler } from '@axioma-framework/qontum';
import { Tooltip } from './tooltip';
import { BatchTranslation } from '@axioma/wealth-services';
import { SupportedUnitAnalytics, getFormatter } from '@axioma/wealth-commons';
import { WealthPortfolioDrillDownRO } from '@axioma/wealth-types';

export type WealthTimeSeriesExpectations = TwoWayExpectations<{
    data: Promise<Series>;
    date: Option<DateTime>;
    analytic: SupportedUnitAnalytics;
    styles: (e: HTMLElement) => void;
    drillDownData: WealthPortfolioDrillDownRO
    loading: boolean;
}, {},
    {
        setTimeScale: (timeScale: string) => void;
    }>;
export type Series = {
    color: string;
    values: [number, DateTime][];
}
type RenderDataArg = {
    version: number;
    response: Series;
}

@Component({})
export class TimeSeriesWidget extends Vue.extend(VueTemplate) {

    @Prop()
    public handler!: ChildHandler<WealthTimeSeriesExpectations>;
    protected _version!: number;
    protected label = '';
    protected sublabel = '';
    private xDomain = XAxis.domain;
    private yDomain = YAxis.domain;
    private chart!: Deferred<{ $el: HTMLElement }>;
    private _chart!: HTMLElement;
    private timeScale = '1w';
    private fullData!: Series;
    private _time!: ChartInstance<Series[]>;
    private _filter = [] as number[];
    protected created(): void {
        this.handler.init(this, {
            setTimeScale: this.setTimeScale
        });

    }


    protected mounted(): void {
        this._chart = this.$refs.chart as HTMLElement;
        this._version = 0;
        this.chart = new Deferred();
        this._chart.innerHTML = '';
        this.createLineChart().then(chart => {
            this._time = chart;
            this._chart.appendChild(this._time.svg);
            const { width, height } = this._chart.getBoundingClientRect();
            if (!width || !height) {
                return;
            }
            this._time.setSize(width, height);
            this.handler.styles().call(null, this.$el);
        });
        let version = 0;
        const obs = new ResizeObserver(([{ contentRect: { width, height } }]) => {
            if (!width || !height) {
                return;
            }
            this._time.setSize(width, height);
        });
        obs.observe(this._chart);
        this.onDestroy(() => obs.disconnect());
        this.$watch(this.handler.data, () => {
            const cached = cachedValue(() => {
                const date = this.handler.date();
                return `${date}`;
            }, () => {
                version++;
                this._version = version;
                return this.getSeriesChartData().then(response => ({ response, version }));
            });

            this.$watch(cached, pro => pro.then(this.showLineChart), { immediate: true });
            this.$watch(() => this._filter.join(','), () => cached().then(this.showLineChart));
        }, { immediate: true });
    }

    protected render(h: CreateElement): VNode {
        const handler: ChartWidgetHandler<unknown> = {
            title: '',
            subtitle: '',
            chart: this.chart.promise,
            hideDownload: false,
            onResize: () => {
                // temp workaround; will be handled in Gallery
                this.chart.promise.then(e => {
                    const toolbar = this._chart.closest('.qontum-chart-widget-container')?.querySelector('.chart-actions') as HTMLDivElement;
                    if (toolbar) {
                        const isFullScvreen = e.$el.parentElement?.classList.contains('qontum-chart-full-screen');
                        if (isFullScvreen) {
                            toolbar.classList.remove('position-absolute');
                            toolbar.style.position = 'fixed';
                            toolbar.style.zIndex = '101';
                        } else {
                            toolbar.classList.add('position-absolute');
                            toolbar.style.position = '';
                            toolbar.style.zIndex = '';
                        }
                    }
                });
            }
        };

        return h(ChartWidget, {
            handler
        });
    }

    private createLineChart(): Promise<ChartInstance<Series[]>> {
        let analytic: SupportedUnitAnalytics = 'marketValue';
        if (this.handler.analytic && this.handler.analytic()) {
            analytic = this.handler.analytic();
            this.label = this.$t(BatchTranslation[analytic]).toString();
            this.handler.data().then(data => {
                const values = data.values;
                if (this.handler.drillDownData().assetDetailsFinal) {
                    this.sublabel = getFormatter(values[values.length - 1][0], analytic, false);
                }
            });
        }
        return this.handler.data().then(() => {
            return createChart<Series[], BaseExtras>({
                init: [],
                xAxis: XAxis.createDateAxis({ domain: this.xDomain, ticks: this.getTicks }),
                yAxis: [YAxis.createNumericAxis({ domain: this.yDomain, tickFormat: (num) => getFormatter(num, analytic) })],
                tooltip: (ev, chart) => {
                    const tooltip = compile<Tooltip>({
                        parent: this,
                        component: Tooltip,
                        propsData: {}
                    });
                    tooltip.mount();
                    document.body.appendChild(tooltip.$el);
                    const x = ev.clientX;
                    const y = ev.clientY;
                    tooltip.$el.style.left = x + 'px';
                    tooltip.$el.style.top = y + 'px';
                    return {
                        dispose: () => tooltip.$destroy(),
                        tooltipElement: () => tooltip.$el,
                        update: ev => {
                            const timeSeries = chart.timeSeries(ev);
                            const value = timeSeries?.xIndex;
                            if (typeof value !== 'number' || value === -1) {
                                return;
                            }
                            const data = this._time.data;
                            tooltip.date = data[0].values[value][1];
                            tooltip.series = data.map(i => {
                                return {
                                    value: i.values[value][0],
                                };
                            });
                            tooltip.analytic = this.handler.analytic();
                        }
                    };
                },
                updateInfo: (data, info) => {
                    const [xDomain, yDomain] = xyMinMaxDeep(data, i => i.values, i => i[1], i => i[0]);
                    info.xDomain = xDomain;
                    info.yDomain = yDomain;
                },
                charts: [
                    chartType.lines({
                        xDomain: XAxis.domain,
                        yDomain: YAxis.domain,
                        series: e => e,
                        values: e => e.values,
                        getX: e => e[1],
                        getY: e => e[0],
                        color: e => e.color,
                        lineWidth: () => 1
                    })
                ],
            });
        });
    }

    private getTicks(): number {
        if (this.timeScale === '1w') {
            return 2;
        }
        return 10;
    }

    private getSeriesChartData(): Promise<Series> {
        return this.handler.data()
            .then(results => {
                if (results) {
                    return results;
                }
                return Promise.resolve({ color: '', values: [] });
            });
    }

    private setTimeScale(time: string): void {
        this.timeScale = time;
        const dataReady = {
            color: this.fullData.color,
            values: this.filterData(this.timeScale, this.fullData.values)
        };
        this._time.setData([dataReady]);
    }

    private showLineChart(result: RenderDataArg | null): void {
        this.chart.resolve({ $el: this._chart });
        if (!document.body.contains(this._chart)) {
            requestAnimationFrame(() => {
                this.showLineChart(result);
            });
            return;
        }
        if (!result) {
            this._time.setData([]);
            return;
        }
        const { response } = result;
        this.fullData = response;
        const dataReady = {
            color: response.color,
            values: this.filterData(this.timeScale, response.values)
        };
        this._time.setData([dataReady]);
    }

    private filterData(range: typeof chartDateRange[number], data: [number, DateTime][]): [number, DateTime][] {
        const sortedData = data.sort((a, b) => a[1].toMillis() - b[1].toMillis());

        const max = sortedData[sortedData.length - 1][1];
        const oneWeekAgo = max.minus({ weeks: 1 });
        const oneMonthAgo = max.minus({ months: 1 });
        const threeMonthsAgo = max.minus({ months: 3 });
        const sixMonthsAgo = max.minus({ months: 6 });
        const oneYearAgo = max.minus({ years: 1 });
        const fiveYearsAgo = max.minus({ years: 5 });
        switch (range) {
            case '1w':
                return sortedData.filter(([_, date]) => date >= oneWeekAgo);
            case '1m':
                return sortedData.filter(([_, date]) => date >= oneMonthAgo);
            case '3m':
                return sortedData.filter(([_, date]) => date >= threeMonthsAgo);
            case '6m':
                return sortedData.filter(([_, date]) => date >= sixMonthsAgo);
            case '1y':
                return sortedData.filter(([_, date]) => date >= oneYearAgo);
            case '5y':
                return sortedData.filter(([_, date]) => date >= fiveYearsAgo);
            case 'All':
            default:
                return data;
        }
    }
}

