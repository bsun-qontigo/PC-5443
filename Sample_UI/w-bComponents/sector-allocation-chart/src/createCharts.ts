import { evalSvg, getTextHeight } from './hiddenRender';
import { valueFn } from '@axioma/core';
import * as d3 from 'd3';
import { ChartData, ChartInstance, ChartOptions, ChartRender, ChartTooltips, Point, SvgSize } from './type-ext';
import { createTooltip } from './types/tooltip';
const TWO_FRAMES = 120;
export type SvgElm<Datum> = d3.Selection<SVGSVGElement, Datum, null, undefined>;
export function createChart<Datum, Info extends {}>({ xAxis, yAxis, updateInfo, charts, init, tooltip }: ChartOptions<Datum, Info>): ChartInstance<Datum> {
	const EXTERNAL_PADDING = getTextHeight();
	let size = {
		width: 0,
		height: 0,
	};
	let series: Datum = init;
	let queued = false;
	const svg = d3.create('svg');
	const main = svg.append('g');
	const xAxisSvg = main.append('g').classed('x-axis', true);
	const yAxisSvg = main.append('g').classed('y-axis', true);
	const chartSvg = main.append('g').classed('chart-content', true);
	const chartsElms = charts.map((_, idx) => {
		// create a g for each chart, so the order is kept on repaints
		return chartSvg
			.selectAll(`g.chart-${idx}-container`)
			.data([null])
			.join('g')
			.classed(`chart-${idx}-container`, true);
	});
	if (tooltip) {
		let handlerCache = () => {
			const handler = Object.create(baseTooltips);
			chartsCache().forEach(i => {
				if (i.tooltip?.chartType) {
					const tooltip = i.tooltip;
					handler[i.tooltip.chartType] = function (ev: MouseEvent & { point: Point }) {
						return tooltip(ev.point, info, series);
					};
				}
			});
			handlerCache = valueFn(handler);
			return handler;
		};
		createTooltip(() => handlerCache(), chartSvg, tooltip);
	}
	const info: ChartData<Info> = {
		anim: 200,
		dataChanged: true,
		svg: svg,
		xAxis: xAxis,
		yAxis: yAxis,
		size: { width: 0, height: 0 },
		xSize: { width: 0, height: 0 },
		ySize: { width: 0, height: 0 },
		container: xAxisSvg,
	} as ChartData<Info>;
	updateInfo(init, info);
	let chartsCache = (): ChartRender<Datum, Info>[] => {
		const c = charts.map(i => i(xAxis, yAxis)) as unknown as ChartRender<Datum, Info>[];
		chartsCache = valueFn(c);
		return c;
	};
	const calcX = (svg: SvgElm<undefined>) => {
		info.container = svg.append('g');
		return xAxis.calc(info);
	};
	const calcY = (svg: SvgElm<undefined>) => {
		info.container = svg.append('g');
		return yAxis.calc(info);
	};
	const renderX = () => {
		info.container = xAxisSvg;
		xAxis.render(info);
	};
	const renderY = () => {
		info.container = yAxisSvg;
		yAxis.render(info);
	};
	const renderCharts = () => {
		info.container = chartSvg;
		info.size.width = size.width - info.ySize.width - EXTERNAL_PADDING;
		info.size.height = size.height - info.xSize.height - EXTERNAL_PADDING;
		info.container.attr('transform', `translate(${info.ySize.width},0)`);
		chartsCache().forEach((i, idx) => {
			info.container = chartsElms[idx] as unknown as d3.Selection<SVGGElement, undefined, null, undefined>;
			i(info, series);
		});
	};
	let times = 0;
	const redraw = () => {
		if (!document.body.contains(svg.node())) {
			if (times < TWO_FRAMES) {
				requestAnimationFrame(redraw);
				times++;
			} else {
				times = 0;
			}
			return;
		}
		times = 0;
		queued = false;
		if (info.dataChanged) {
			updateInfo(series, info);
		}
		const { width, height } = size;
		svg
			.attr('width', width)
			.attr('height', height)
			.attr('viewBox', [0, 0, width, height]);
		main.attr('transform', `translate(0, ${EXTERNAL_PADDING})`);
		info.size.width = width - EXTERNAL_PADDING;
		info.size.height = height - EXTERNAL_PADDING;
		const tryMore = (svg: SvgElm<undefined>) => {
			const newX = calcX(svg);
			const newY = calcY(svg);
			let changed = false;
			if (rectChanged(info.xSize, newX)) {
				changed = true;
				info.xSize = newX;
			}
			if (rectChanged(info.ySize, newY)) {
				changed = true;
				info.ySize = newY;
			}
			return changed;
		};
		evalSvg(svg => {
			let iter = 0;
			while (tryMore(svg)) {
				iter++;
				if (iter > 10) {
					if (IsProd) {
						break;
					}
					throw new Error('too many iters?');
				}
				svg.html('');
			}
		});
		renderX();
		renderY();
		renderCharts();
		info.dataChanged = false;
	};
	return {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		svg: svg.node()!,
		setSize: (width, height) => {
			size = { width, height };
			if (queued) { return; }
			queued = true;
			requestAnimationFrame(redraw);
		},
		setData: s => {
			series = s;
			info.dataChanged = true;
			if (queued) { return; }
			queued = true;
			requestAnimationFrame(redraw);
		},
	};
}
function rectChanged(a: SvgSize, b: SvgSize) {
	return a.height !== b.height || a.width !== b.width;
}
const baseTooltips: ChartTooltips = {
	bar: function () {
		if (IsProd) {
			return {
				axis: '',
				value: 0
			};
		}
		throw new Error('Invalid call to bar tooltip when no bar is present in the chart');
	},
};
