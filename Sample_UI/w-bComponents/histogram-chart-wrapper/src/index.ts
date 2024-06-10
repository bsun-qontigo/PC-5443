import { ChildHandler, Component, OneWayExpectations, Prop, Vue, compile } from '@axioma/vue';
import VueTemplate from './template.vue';
import { DateTime } from 'luxon';
import { Deferred, cachedValue, Option } from '@axioma/core';
import { createChart, chartType, ChartInstance, XAxis, YAxis, HistogramExtra, ChartData } from '@axioma-framework/charts';
import { Tooltip } from './tooltip';
import * as d3 from 'd3';
import en from './assets/en';
import { plugins } from '@axioma/common';
import { SupportedUnitAnalytics } from '@axioma/wealth-commons';

plugins.lang.mergeLocaleMessage('en', en);

export type WealthHistogramChartExpectations<T> = OneWayExpectations<{
    analytic: SupportedUnitAnalytics;
    data: Promise<T[]>;
    date: Option<DateTime>;
    valueGetter: (e: T) => number;
    loading: boolean;
    chartOptions: {
        title: () => string;
        color: () => string;
        xAxis: {
            label: () => string;
        },
        yAxis: {
            label: () => string;
        }
    },
}, {
    clicked: (d: ChartData<HistogramExtra<T>>) => void;
}>;

@Component({})
export class HistogramChartWidget<T> extends Vue.extend(VueTemplate) {

    @Prop()
    public handler!: ChildHandler<WealthHistogramChartExpectations<T>>;
    protected _version!: number;
    protected label = '';
    private chart!: Deferred<{ $el: HTMLElement }>;
    private _chart!: HTMLElement;
    private _histogram!: ChartInstance<T[]>;

    protected get title(): string {
        return this.handler.chartOptions().title() ?? '';
    }
    protected mounted(): void {
        this._chart = this.$refs.chart as HTMLElement;
        this._chart.classList.add('all-height', 'all-width');
        this._version = 0;
        let version = 0;
        this.chart = new Deferred();
        const xDomain = XAxis.domain;
        const yDomain = YAxis.domain;
        const bins = (e: ChartData<HistogramExtra<T>>) => e.bins;
        const histogram = d3.bin<T, number>().thresholds(10).value(this.handler.valueGetter());
        const fmt = d3.format('.2s');
        const xAxis = XAxis.createBinAxis<T, HistogramExtra<T>>({ label: this.handler.chartOptions().xAxis.label, bins: info => info.bins[0] ?? [] as unknown as d3.Bin<T, number>[], domain: xDomain, tickFormat: d => fmt(d) });
        this._histogram = createChart<T[], HistogramExtra<T>>({
            xAxis,
            yAxis: [YAxis.createNumericAxis({ domain: yDomain, label: this.handler.chartOptions().yAxis.label })],
            tooltip: (_ev, chart) => {
                const tooltip = compile<Tooltip>({
                    parent: this,
                    component: Tooltip,
                    propsData: {
                        analytic : this.handler.analytic()
                    }
                });
                return {
                    dispose: () => tooltip.$destroy(),
                    tooltipElement: () => tooltip.$el,
                    update: ev => {
                        const histogram = chart.histogram(ev);
                        if (histogram) {
                            tooltip.mount();
                            tooltip.$el.style.display = 'block';
                            document.body.appendChild(tooltip.$el);
                            tooltip.$el.style.left = `${histogram.x}px`;
                            tooltip.$el.style.top = `${histogram.y}px`;
                            tooltip.min = histogram.min;
                            tooltip.max = histogram.max;
                            tooltip.count = histogram.count;
                        } else {
                            tooltip.$el.style.display = 'none';
                        }
                    }
                };
            },
            init: [],
            charts: [
                chartType.xGrid(),
                chartType.histogram({
                    xDomain,
                    yDomain,
                    bins,
                    color: this.handler.chartOptions().color,
                    click: this.handler.clicked
                })
            ],
            updateInfo: (results, info) => {
                if (results.length === 0) {
                    info.xDomain = [0, 0];
                    info.yDomain = [0, 0];
                    info.bins = [];
                } else {
                    const bins = histogram(results);
                    const yDomainMultiplier = 1.1;
                    info.xDomain = [bins[0].x0 as number, bins[bins.length - 1].x1 as number];
                    info.yDomain = [0, d3.max(bins, i => i.length) as number];
                    info.yDomain[1] = Math.ceil(info.yDomain[1] as number * yDomainMultiplier);
                    info.bins = [bins];
                }
            },
        });
        this._chart.append(this._histogram.svg);
        const obs = new ResizeObserver(([{ contentRect: { width, height } }]) => {
            if (!width || !height) {
                return;
            }
            this._histogram.setSize(width, height);
        });
        obs.observe(this._chart);
        this.$watch(this.handler.data, () => {
            const cached = cachedValue(() => {
                const date = this.handler.date();
                return `${date}`;
            }, () => {
                version++;
                this._version = version;
                return this.getChartData().then(response => ({ response, version }));
            });

            this.$watch(cached, pro => pro.then(this.showHistogramChart), { immediate: true });
        }, { immediate: true });
    }
    private getChartData(): Promise<T[]> {
        return this.handler.data()
            .then(results => {
                if (results) {
                    return results;
                }
                return Promise.resolve([]);
            });
    }

    private showHistogramChart(result: { response: T[], version: number }): void {
        this.chart.resolve({ $el: this._chart });
        if (!document.body.contains(this._chart)) {
            requestAnimationFrame(() => {
                this.showHistogramChart(result);
            });
            return;
        }
        if (!result) {
            this._histogram.setData([]);
            return;
        }
        this._histogram.setData(result.response);
    }
}

