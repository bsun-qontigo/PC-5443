import * as d3 from 'd3';
import { getTextHeight } from '../hiddenRender';
import { Chart, ChartData } from '../type-ext';
import { withTooltip } from './tooltip';
import { SectorAllocationSeries } from '..';

export type BarHoverData = {
	axis: string;
	value: number;
}

export type BarOptions<Datum, Extras extends {}> = {
	/**
	 * Get the `x` domain ([min, max])
	 * @param d Single datum in the loop
	 * @returns [xMin,xMax]
	 */
	xDomain: (info: ChartData<Extras>) => [d3.NumberValue, d3.NumberValue];
	/**
	 * Get the `y` domain ([min, max])
	 * @param d Single datum in the loop
	 * @returns [yMin,yMax]
	 */
	yDomain: <T extends { yDomain: string[]; }>(info: T) => string[];
	/**
	 * Get the color for a given point
	 * @param d Single datum in the loop
	 * @returns color to use
	 */
	color: (serie: Datum) => string;
	/**
	 * Given the chart data and info, get the lines
	 * @param a Chart data
	 * @param info chart info
	 * @returns List of lines
	 */
	series: (a: Datum[], info: ChartData<Extras>) => Datum[];
	/**
	 * Get a points id
	 * @param d Single point
	 * @returns an id for the point to keep track
	 */
	unique?: (d: Datum, info: ChartData<Extras>) => string;
	/**
	 * Get the legend of the series
	 * @param d Single point
	 * @returns a name for the legend of the series
	 */
	legend?: (d: Datum, info: ChartData<Extras>) => string;
	/**
	 * Get the value of the serie
	 * @param d Single point
	 * @returns a value for the serie
	 */
	value: (d: Datum, info?: ChartData<Extras>) => number;
}

export function barHorizontal<Series, Extras extends {}>(opts: BarOptions<Series, Extras>): Chart<Series[], Extras> {
	const { xDomain, yDomain, series, unique, value, color, legend } = opts;
	return function (_x, _y) {
		const x = _x.scale.copy();
		const y = _y.scale.copy();
		let lastWidth = 0;
		let lastAnim = 0;
		let lastInfo: ChartData<Extras>;
		const calculateRangeLeft = (data: Series[]): number => Math.min(niceFloor(Math.min(...data.map(v => value(v)))), 0);
		const calculateX = (d: Series, p: number): number => {
			const x0 = x(0);
			const xd = x((d as SectorAllocationSeries).value);
			const xp = x(p);
			if (x0 > xd) {
				return xp - x0;
			} else {
				// keep this form to show its original meaning
				return (xp - x0) + (x0 - xd);
			}
		};
		const add = <T extends d3.Selection<d3.EnterElement, Series, SVGGElement, undefined>>(data: Series[], s: T) => {
			const p = calculateRangeLeft(data);
			return update(data, s
				.append('rect')
				.classed('bar', true)
				.attr('x', d => calculateX(d, p))
				.attr('width', (d) => Math.abs(x(0) - x((d as SectorAllocationSeries).value)))
				.attr('y', (d) => y((d as unknown as SectorAllocationSeries).sector) as number)
				.attr('height', () => y.bandwidth())
				.style('fill', color) as unknown as d3.Selection<d3.BaseType, Series, SVGGElement, undefined>);
		};
		const update = <T extends d3.Selection<d3.BaseType, Series, SVGGElement, undefined>>(data: Series[], s: T) => {
			const p = calculateRangeLeft(data);
			return s
				.transition()
				.duration(lastAnim)
				.attr('x', d => calculateX(d, p))
				.attr('width', (d) => Math.abs(x(0) - x((d as SectorAllocationSeries).value)))
				.attr('y', (d) => y((d as unknown as SectorAllocationSeries).sector) as number)
				.attr('height', () => y.bandwidth());
		};
		const remove = <T extends d3.Selection<d3.BaseType, Series, SVGGElement, undefined>>(s: T) => {
			return s.remove();
		};

		const t = (d: Series) => {
			const v = value(d, lastInfo);
			let dx = lastWidth - x(value(d, lastInfo)) + (getTextHeight() / 2);
			if (v < 0) {
				dx = lastWidth - x(value(d, lastInfo)) - (getTextHeight() / 2);
			}
			return `translate(${dx}, ${y((d as SectorAllocationSeries).sector) as number + (y.bandwidth() / 2) + (getTextHeight() / 4)})`;
		};
		const addCount = <T extends d3.Selection<d3.EnterElement, Series, SVGGElement, undefined>>(s: T) => {
			return updateCount(s.append('text')
				.classed('bar', true)
				.attr('fill', 'currentColor')
				.attr('transform', t)
				.attr('text-anchor', d => value(d, lastInfo) >= 0 ? 'start' : 'end') as unknown as d3.Selection<d3.BaseType, Series, SVGGElement, undefined>
			);
		};
		const updateCount = <T extends d3.Selection<d3.BaseType, Series, SVGGElement, undefined>>(s: T) => {
			return s
				.transition()
				.duration(lastAnim)
				.text(d => value(d, lastInfo).toFixed(2))
				.attr('transform', t)
				.attr('text-anchor', d => value(d, lastInfo) >= 0 ? 'start' : 'end');
		};
		const removeCount = <T extends d3.Selection<d3.BaseType, Series, SVGGElement, undefined>>(s: T) => {
			return s.remove();
		};
		const unike = unique && ((d: unknown) => {
			return unique(d as Series, lastInfo);
		});
		return withTooltip('bar', function (info, data) {
			lastInfo = info;
			lastWidth = info.size.width;
			lastAnim = info.anim;
			x.domain(xDomain(info)).range([info.size.width, 0]);
			y.domain(yDomain(info as unknown as { yDomain: string[]; })).range([0, info.size.height]);
			const g = info.container;
			g.selectAll('rect.bar')
				.data(series(data, info), unike)
				.join(add.bind(null, data), update.bind(null, data), remove);
			g.attr('fill', 'none')
				.attr('font-size', '10')
				.attr('font-family', 'sans-serif')
				.selectAll('text.bar')
				.data(series(data, info), unike)
				.join(addCount, updateCount, removeCount);
		}, (ev, info, data): BarHoverData | void => {
			const yPoint = ev.y;
			y.domain(yDomain(info as unknown as { yDomain: string[]; })).range([0, info.size.height]);
			const result = series(data, info).find((s) => {
				const sector = y((s as SectorAllocationSeries).sector) as number;
				const minY = sector;
				const maxY = sector + y.bandwidth();
				return yPoint >= minY && yPoint <= maxY;
			});
			if (result) {
				const name = legend ? legend(result as Series, info) : '';
				const val = value(result as Series, info);
				return { axis: name, value: val ? val : 0 };
			}
		});
	};
}

// TODO we need more clear definitions; d3.nice()
export const niceFloor = (v: number): number => Math.floor((v / 10) * 10) * 1.2;
export const niceCeil = (v: number): number => Math.ceil((v / 10) * 10) * 1.2;