import { ChartData, ChartRender, ChartTooltips, Point, TooltipHandler } from '../type-ext';
import * as d3 from 'd3';

export function createTooltip(handlers: () => Record<string, Function>, svg: d3.Selection<SVGGElement, undefined, null, undefined>, tooltip: UserTooltip): void {
	let queued = false;
	let e: MouseEvent;
	let user: UserTooltipRendered;
	svg.on('mouseenter', mouseenter);
	function mousemove(ev: MouseEvent) {
		e = ev;
		if (queued) {
			return;
		}
		queued = true;
		requestAnimationFrame(render);
	}
	function mouseenter(ev: MouseEvent) {
		e = ev;
		svg.on('mousemove', mousemove);
		svg.on('mouseleave', mouseleave);
		user = tooltip(calcPoint(ev, svg), handlers() as ChartTooltips);
	}
	function mouseleave() {
		queued = false;
		user.dispose();
		user = null as unknown as UserTooltipRendered;
		svg.on('mousemove', null);
		svg.on('mouseleave', null);
	}
	function render() {
		if (queued) {
			queued = false;
			user.update(calcPoint(e, svg), handlers() as ChartTooltips);
		}
	}
}

function calcPoint(e: MouseEvent, svg: d3.Selection<SVGGElement, undefined, null, undefined>): MouseEvent & { point: Point } {
	const ev = e as MouseEvent & { point: Point };
	const mouseCoords = d3.pointer(e, svg.node());
	ev.point = {
		x: mouseCoords[0],
		y: mouseCoords[1]
	};
	return ev;
}

export type UserTooltip = {
	(ev: MouseEvent, charts: ChartTooltips): UserTooltipRendered;
}

export type UserTooltipRendered = {
	update(ev: MouseEvent, chart: ChartTooltips): void;
	dispose(): void;
}

export function noTooltip<A, B extends {}>(f: (info: ChartData<B>, data: A) => void): ChartRender<A, B> {
	const t = f as ChartRender<A, B>;
	t.tooltip = nothing as unknown as undefined;
	return t;
}

export function withTooltip<A, B extends {}>(name: keyof ChartTooltips, chartHandler: (info: ChartData<B>, data: A) => void, tooltipHandler: (ev: Point, info: ChartData<B>, data: A) => unknown): ChartRender<A, B> {
	const t = chartHandler as ChartRender<A, B>;
	t.tooltip = wrapHandler(name, tooltipHandler) as TooltipHandler<A, B>;
	return t;
}

function wrapHandler<Data, B extends {}>(name: keyof ChartTooltips, tooltip: (ev: Point, info: ChartData<B>, data: Data) => unknown): TooltipHandler<Data, B> {
	const t = tooltip as TooltipHandler<Data, B>;
	t.chartType = name;
	return t;
}
function nothing() {
	return;
}
