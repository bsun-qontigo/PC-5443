import { Component, Vue, Prop, compile, OneWayExpectations, createOneWayBinding, createTwoWayBinding, ChildHandler, CreateElement, VNode, ParentHandler } from '@axioma/vue';
import en from './assets/en';
import { plugins } from '@axioma/common';
import { ColorState, ChartInstance, XAxis } from '@axioma-framework/charts';
import { ChartWidget, ChartWidgetHandler, PillLegend, PillLegendExpectations } from '@axioma-framework/qontum';
import { Deferred, cachedValue, Option } from '@axioma/core';
import { DateTime } from 'luxon';
import { Tooltip } from './tooltip';
import { WealthPortfolioDrillDownRO } from '@axioma/wealth-types';
import { createChart } from './createCharts';
import { AxisRender, BaseExtras, ScaleBandAxisRender } from './type-ext';
import { chartType } from './types';
import * as YAxis from './axis/y';
import { PortfolioDrillDownRO } from '@axioma/wealth-models';
import { niceCeil, niceFloor } from './types/bar';
import SpaceViewSelector, { WealthDataSpace, WealthDataView, SpaceViewSelectorHandler, keyToI18n } from '@axioma-components/wealth-space-view-selector';
import { getFigmaToken } from '@axioma/style-tokens';
import { ChartDownloadHelpers } from '@axioma/wealth-commons';
import { createNumericAxis } from './axis/x/number';

plugins.lang.mergeLocaleMessage('en', en);

export type SectorAllocationSeries = {
    id: number;
    value: number;
    sector: string;
    color: string;
}

export type BarExpectation = OneWayExpectations<{
    portfolioData: Promise<WealthPortfolioDrillDownRO>;
    date: () => Option<DateTime>;
    title: ChartWidgetHandler<unknown>['title'];
    showTitle: boolean;
    loading: boolean;
}, {}>;

type DataField = keyof (Pick<PortfolioDrillDownRO, 'sectorAllocationInitial' | 'sectorAllocationFinal' | 'sectorActiveAllocationInitial' | 'sectorActiveAllocationFinal'>);

@Component({})
export default class SectorAllocationWidget extends Vue {
    @Prop()
    public handler!: ChildHandler<BarExpectation>;
    protected _version!: number;
    protected spaceViewSelectorHandler!: ParentHandler<SpaceViewSelectorHandler>;
    private chart!: Deferred<{ $el: HTMLElement }>;
    private _chart!: HTMLElement;
    private _pills!: PillLegend<SectorAllocationSeries>;
    private _bar!: ChartInstance<SectorAllocationSeries[]>;
    private _color!: ColorState;
    private _filter = [] as number[];
    private selectedField: DataField = 'sectorAllocationFinal';
    private selectedSpace: WealthDataSpace = 'total';
    private selectedView: WealthDataView = 'final';
    private _isSpaceAndViewToggleButtonsAdded = false;

    protected created(): void {
        this._color = new ColorState();
        this._chart = document.createElement('div');
        this._chart.style.maxHeight = getFigmaToken('sizing-350');
        this._chart.classList.add('all-height', 'all-width');
        this._version = 0;
        this.chart = new Deferred();
        this._pills = new PillLegend(
            createOneWayBinding<PillLegendExpectations<SectorAllocationSeries>>()
                .byRef('series', () => ({ data: [] }))
                .owned('options', {
                    serieName: e => e.sector || `Bar: ${e.id + 1}`,
                    color: e => this._color.getColorIndex(e.id.toString())
                })
                .byRef('tooltips', () => false)
                .on('serieToHide', (a: { id: number; }) => {
                    const idx = this._filter.indexOf(a.id);
                    if (idx !== -1) {
                        this._filter.splice(idx, 1);
                    } else {
                        this._filter.push(a.id);
                    }
                    return;
                })
                .create() as unknown as ChildHandler<PillLegendExpectations<SectorAllocationSeries>>
        );
        this._chart.innerHTML = '';
        this.createBarChart().then(chart => {
            this._bar = chart;
            this._chart.appendChild(this._bar.svg);
            this._chart.appendChild(this._pills.LegendElement);
            const { width, height } = this._chart.getBoundingClientRect();
            if (!width || !height) {
                return;
            }
            const pill = this._pills.LegendElement.getBoundingClientRect();
            this._bar.setSize(width, height - pill.height);
        });
        this.createSpaceAndViewSelectorHandler();
    }

    protected mounted(): void {
        const obs = new ResizeObserver(([{ contentRect: { width, height } }]) => {
            if (!width || !height) {
                return;
            }
            const pill = this._pills.LegendElement.getBoundingClientRect();
            this._bar.setSize(width, height - pill.height);
        });
        obs.observe(this._chart);
        this.onDestroy(() => obs.disconnect());
        this.$watch(this.handler.portfolioData, () => {
            if (!this.handler.loading()) {
                let version = 0;
                const cached = cachedValue(() => {
                    const date = this.handler.date();
                    return `${date}-${this.selectedField}`;
                }, () => {
                    version++;
                    this._version = version;

                    return Promise.all([
                        this.getBarChartData(),
                        version
                    ]);
                });


                this.$watch(cached, pro => pro.then(this.showBarChart), { immediate: true });
                this.$watch(() => this._filter.join(','), () => cached().then(this.showBarChart));
            }
        }, { immediate: true });
    }

    protected render(h: CreateElement): VNode {
        let title: { value: string; tooltipValueGetter: () => string; } = { value: '', tooltipValueGetter: () => '' };
        if (this.handler.title && this.handler.title()) {
            title = this.handler.title() as { value: string; tooltipValueGetter: () => string; };
        }
        if (!this.handler.showTitle()) {
            title = { value: '', tooltipValueGetter: () => '' };
        }
        const handler: ChartWidgetHandler<unknown> = {
            title: title,
            subtitle: '',
            chart: this.chart.promise,
            hideDownload: false,
            onDownload: (chart) => {
                this.chart.promise.then(e => {
                    const toolbar = this._chart.closest('.qontum-chart-widget-container')?.querySelector('.chart-actions') as HTMLDivElement;
                    const isFullScreen = toolbar && e.$el.parentElement?.classList.contains('qontum-chart-full-screen');
                    const { Downloader, TitleLayer } = ChartDownloadHelpers;
                    const downloader = new Downloader(chart, title.value);
                    downloader
                        .addLayers([new TitleLayer(downloader, `${title.value} (${keyToI18n(this.selectedSpace)}/${keyToI18n(this.selectedView)})`, {}, isFullScreen)])
                        .download();
                });
            },
            onResize: () => {
                // temp workaround; will be handled in Gallery
                this.chart.promise.then(e => {
                    const isFullScreen = e.$el.parentElement?.classList.contains('qontum-chart-full-screen');
                    const toolbar = this._chart.closest('.qontum-chart-widget-container')?.querySelector('.chart-actions') as HTMLDivElement;
                    if (toolbar) {
                        if (isFullScreen) {
                            toolbar.classList.remove('position-absolute');
                            toolbar.style.position = 'fixed';
                            toolbar.style.zIndex = '101';
                        } else {
                            toolbar.classList.add('position-absolute');
                            toolbar.style.position = '';
                            toolbar.style.zIndex = '';
                        }
                    }
                    const title = this._chart.closest('.qontum-chart-widget-container')?.querySelector(':first-child') as HTMLDivElement;
                    if (title) {
                        if (isFullScreen) {
                            title.style.position = 'fixed';
                            title.style.top = getFigmaToken('spacing-6');
                            title.style.left = getFigmaToken('spacing-10');
                            title.style.zIndex = '101';
                        } else {
                            title.style.position = '';
                            title.style.top = '0';
                            title.style.left = '0';
                            title.style.zIndex = '';
                        }
                    }
                });
            }
        };

        return h(ChartWidget, {
            handler
        });
    }

    private getBarChartData(): Promise<SectorAllocationSeries[]> {
        return this.handler.portfolioData()
            .then(results => {
                if (!results.assetDetailsFinal && this.selectedView === 'final') {
                    this.spaceViewSelectorHandler.child.then(x => {
                        x.setDisableViewSelector(true);
                        x.setSelectedView('initial');
                        x.setViewValues(['initial']);
                    });
                    this.selectedView = 'initial';
                    this.selectedField = 'sectorAllocationInitial';
                }
                const data: SectorAllocationSeries[] = [];
                const r = results[this.selectedField] ?? {} as Record<string, number>;
                Object.keys(r)
                    .forEach((key, idx) => {
                        data.push({
                            id: idx,
                            value: r ? r[key] * 100 : 0,
                            sector: key,
                            color: ''
                        });
                    });
                return data;
            });
    }

    private createBarChart(): Promise<ChartInstance<SectorAllocationSeries[]>> {
        const color = (e: SectorAllocationSeries) => e.color;
        return this.handler.portfolioData().then(data => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const xDomain = XAxis.domain as (info: any) => [d3.NumberValue, d3.NumberValue];
            const yDomain = data.sectorAllocationFinal ? Object.keys(data.sectorAllocationFinal) : [];
            return createChart<SectorAllocationSeries[], BaseExtras>({
                init: [],
                xAxis: createNumericAxis({ label: () => this.$t('SECTOR_ALLOCATION_CHART.PERCENT').toString(), domain: xDomain }) as AxisRender<BaseExtras>,
                yAxis: YAxis.createScaleBandAxis({ label: () => '', domain: () => yDomain }) as ScaleBandAxisRender<BaseExtras>,
                tooltip: (ev, chart) => {
                    const bar = chart.bar(ev);
                    const tooltip = compile<Tooltip>({
                        parent: this,
                        component: Tooltip,
                        propsData: {}
                    });
                    if (bar?.axis) {
                        tooltip.mount();
                        document.body.appendChild(tooltip.$el);
                        const x = ev.clientX;
                        const y = ev.clientY;
                        tooltip.$el.style.left = x + 'px';
                        tooltip.$el.style.top = y + 'px';
                    }
                    return {
                        dispose: () => tooltip.$destroy(),
                        update: (ev) => {
                            const bar = chart.bar(ev);
                            if (bar && bar.axis) {
                                tooltip.axis = bar.axis;
                                tooltip.value = bar.value;
                            }
                        }
                    };
                },
                updateInfo: (data, info) => {
                    const values = data.map(i => i.value);
                    let maxValue = 100;
                    let minValue = 0;
                    if (values.length > 0) {
                        maxValue = niceCeil(Math.max(...values));
                        minValue = niceFloor(Math.min(...values));
                    }
                    if (minValue > 0) {
                        minValue = 0;
                    }
                    if (maxValue < 0) {
                        maxValue = 0;
                    }
                    if (data.length === 0) {
                        info.xDomain = [minValue, maxValue];
                        info.yDomain = [];
                    } else {
                        info.xDomain = [minValue, maxValue];
                        info.yDomain = data.map(i => i.sector);
                    }
                },
                charts: [
                    chartType.xGrid(),
                    chartType.barHorizontal({
                        color,
                        series: e => e,
                        value: e => e?.value,
                        xDomain: XAxis.domain,
                        yDomain: YAxis.domain,
                        legend: e => e?.sector,
                        unique: e => e.sector
                    })
                ]
            });
        }) as Promise<ChartInstance<SectorAllocationSeries[]>>;
    }

    private showBarChart(result: [SectorAllocationSeries[], number] | null): void {
        this.chart.resolve({ $el: this._chart });
        if (!document.body.contains(this._chart)) {
            requestAnimationFrame(() => {
                this.showBarChart(result);
            });
            return;
        }
        if (!result) {
            this._bar.setData([]);
            this._pills.renderSeries([]);
            return;
        }
        const [response, _version] = result;
        const el = this.$el as HTMLElement;
        response.forEach(i => {
            const css = `--datum-${i.value}`;
            if (el.style.getPropertyValue(css) === 'none') {
                el.style.removeProperty(css);
            }
        });

        const colors = this._color;
        colors.before();
        const pills = new Array(response.length) as SectorAllocationSeries[];
        const series = response.reduce((prev, i) => {
            const id = i.id;
            const colorSerie = colors.assign(i.id.toString());
            pills[id] = { ...i, color: colorSerie };
            if (!this._filter.includes(i.id)) {
                prev.push({
                    ...i,
                    color: colorSerie
                });
            }
            return prev;
        }, [] as SectorAllocationSeries[]);
        this._pills.renderSeries(pills);
        if (series) {
            this._bar.setData(series as SectorAllocationSeries[]);
        }
        this.attachSpaceAndViewToggleButtons();
    }

    private attachSpaceAndViewToggleButtons(): void {
        if (!this._isSpaceAndViewToggleButtonsAdded) {
            const toolbar = this._chart.closest('.qontum-chart-widget-container')?.querySelector('.chart-actions');
            if (toolbar) {
                (toolbar as HTMLDivElement).style.top = '8px';
                toolbar.prepend(
                    compile<SpaceViewSelector>({
                        component: SpaceViewSelector,
                        propsData: {
                            handler: this.spaceViewSelectorHandler
                        }
                    }).$elm);
                this._isSpaceAndViewToggleButtonsAdded = true;
            }
        }
    }

    private createSpaceAndViewSelectorHandler(): void {
        const onSpaceOrViewChanged = (): void => {
            if (this.selectedSpace === 'total') {
                if (this.selectedView === 'initial') {
                    this.selectedField = 'sectorAllocationInitial';
                } else {
                    this.selectedField = 'sectorAllocationFinal';
                }
            } else {
                if (this.selectedView === 'initial') {
                    this.selectedField = 'sectorActiveAllocationInitial';
                } else {
                    this.selectedField = 'sectorActiveAllocationFinal';
                }
            }
            if (!this.handler.loading()) {
                Promise.all([this.getBarChartData(), ++this._version])
                    .then(this.showBarChart);
            }
        };
        this.spaceViewSelectorHandler = createTwoWayBinding<SpaceViewSelectorHandler>()
            .on('onSpaceChanged', (ev) => {
                this.selectedSpace = ev;
                onSpaceOrViewChanged();
            })
            .on('onViewChanged', (ev) => {
                this.selectedView = ev;
                onSpaceOrViewChanged();
            })
            .create();
    }
}