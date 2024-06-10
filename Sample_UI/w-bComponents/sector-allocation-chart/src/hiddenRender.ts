import * as d3 from 'd3';
/**
 * render something into a hidden svg (for calculating sizes)
 * @param fn the function will be called with an empty svg
 * @returns what ever `fn` returns
 */
export function evalSvg<T>(fn: (svg: d3.Selection<SVGSVGElement, undefined, null, undefined>) => T): T {
	const s = svg();
	const r = fn(s);
	s.html('');
	return r;
}

let svg = () => {
	new ResizeObserver(([{ contentRect: { width, height } }]) => {
		inner
			.attr('width', width)
			.attr('height', height)
			.attr('viewBox', [0, 0, width, height]);
	}).observe(document.body);
	const inner = d3.create('svg')
		.style('z-index', '-1')
		.style('position', 'fixed')
		.style('visibility', 'hidden');
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	document.body.append(inner.node()!);
	svg = () => inner;
	return inner;
};

let textHeight: number | null = null;
export function getTextHeight(): number {
	if (textHeight === null) {
		textHeight = evalSvg(svg => {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			return svg.append('text')
				.attr('fill', 'currentColor')
				// this is by default what axis' use (same for use)
				.attr('font-size', '10')
				.attr('font-family', 'sans-serif')
				.text('S')
				.node()!.getBBox().height;

		});
	}
	// <text fill="currentColor">S</text>

	return textHeight;
}
