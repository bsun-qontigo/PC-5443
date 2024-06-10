import { UserTooltip } from './types/tooltip';
import { BarHoverData} from './types';

export type ChartInstance<TSerie> = {
	svg: SVGSVGElement;
	setSize(width: number, height: number): void;
	setData(series: TSerie): void;
}
export type ChartOptions<Data, Info extends {}> = {
	xAxis: AxisRender<Info>;
	yAxis: ScaleBandAxisRender<Info>;
	init: Data;
	charts: Chart<Data, Info>[];
	updateInfo: (data: Data, info: Partial<ChartData<Info>>) => void;
	tooltip?: UserTooltip;
}
export type WithTickFormat = {
	tickFormat?: (n: number | {
		valueOf(): number;
	}) => string
}

export type ChartTooltips = {
	bar: (ev: MouseEvent) => BarHoverData;
}
export type AxisOptions<Extras extends {}> = {
	label?: () => string;
	domain: (info: ChartData<Extras>) => [d3.NumberValue, d3.NumberValue];
}

export type ScaleBandAxisOptions<Extras extends {}> = {
	label?: () => string;
	domain: (info: ChartData<Extras>) => string[];
}
export type BaseExtras = {
	xDomain: [d3.NumberValue, d3.NumberValue];
	yDomain: string[];
}

export type Scales = {
	x: AxisRender['scale'],
	y: AxisRender['scale'],
}
export type BasicChartOptions<Series, Datum, Extras extends {}> = {
	/**
		 * Given the chart data, get `Datum[]`;
		 * @param d chart data
		 * @param info chart info
		 * @returns an array of `Datum`
		 */
	values: (d: Series, info: ChartData<Extras>) => Datum[];
	/**
	 * Get `x` coordinate for `Datum`
	 * @param d Single datum in the loop
	 * @returns number-like `X` value for the Datum
	 */
	getX: (d: Datum, info: ChartData<Extras>) => d3.NumberValue;
	/**
	 * Get `y` coordinate for `Datum`
	 * @param d Single datum in the loop
	 * @returns number-like `y` value for the Datum
	 */
	getY: (d: Datum, info: ChartData<Extras>) => d3.NumberValue;
	/**
	 * Get the color for a given point
	 * @param d Single datum in the loop
	 * @returns color to use
	 */
	color: (d: Datum, info: ChartData<Extras>) => string;
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
	yDomain: (info: ChartData<Extras>) => [d3.NumberValue, d3.NumberValue];
	/**
	 * Get a points id
	 * @param d Single point
	 * @returns an id for the point to keep track
	 */
	unique?: (d: Datum, info: ChartData<Extras>) => string;
}
export type Chart<Data, Info extends {}> = (x: AxisRender<Info>, y: ScaleBandAxisRender<Info>) => ChartRender<Data, Info>;
export type ChartRender<Data, T extends {} = {}> = {
	(info: ChartData<T>, data: Data): void
	tooltip?: TooltipHandler<Data, T>;
};
export type Point = {
	x: number;
	y: number;
}
export type TooltipHandler<Data, T extends {}> = {
	(ev: Point, info: ChartData<T>, data: Data): unknown;
	chartType: keyof ChartTooltips;
}
export type SvgSize = Pick<DOMRect, 'height' | 'width'>;
export type AxisRender<T extends {} = {}> = {
	calc: (info: ChartData<T>) => SvgSize;
	render: (info: ChartData<T>) => void;
	scale: NumericScale;
	axis: d3.Axis<d3.NumberValue>;
};

export type ScaleBandAxisRender<T extends {} = {}> = {
	calc: (info: ChartData<T>) => SvgSize;
	render: (info: ChartData<T>) => void;
	scale: BandScale;
	axis: d3.Axis<string>;
};

export type AxisRects = {
	x: SvgSize,
	y: SvgSize,
}

export type ChartData<T extends {}> = {
	dataChanged: boolean;
	anim: number;
	svg: d3.Selection<SVGSVGElement, undefined, null, undefined>;
	container: d3.Selection<SVGGElement, undefined, null, undefined>;
	size: SvgSize;
	xSize: SvgSize;
	ySize: SvgSize;
	yRightSize?: SvgSize;
	xAxis: AxisRender<T>;
	yAxis: ScaleBandAxisRender<T>;
	yRightAxis?: AxisRender<T> | undefined;
} & T;

export type BandScale = {
	(datum: string): number | undefined;
	domain(data: string[]): BandScale;
	range(range: [number, number]): BandScale;
	rangeRound(range: [number, number]): BandScale;
	bandwidth(): number;
	step(): number;
	copy(): BandScale;
}
export type NumericScale = {
	(datum: d3.NumberValue): number;
	invert(n: d3.NumberValue): number;
	domain(minmax: [d3.NumberValue, d3.NumberValue]): NumericScale;
	range(minmax: [d3.NumberValue, d3.NumberValue]): NumericScale;
	ticks(count?: number): d3.NumberValue[];
	copy(): NumericScale;
}
