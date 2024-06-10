import *as d3 from 'd3';
import { AxisOptions, AxisRender, NumericScale, WithTickFormat } from '../../type-ext';
import { getTextHeight } from '../../hiddenRender';
import { getTextExtra } from '../constants';

export function createNumericAxis<Extras extends {}>({ label, domain, showScale = true, tickFormat }: AxisOptions<Extras> & { showScale?: boolean } & WithTickFormat): AxisRender<Extras> {
	const afterScale = d3.scaleLinear();
	const afterAxis = d3.axisBottom(afterScale);
	if (tickFormat) {
		afterAxis.tickFormat(tickFormat);
	}
	return {
		scale: afterScale as NumericScale,
		axis: afterAxis,
		calc: function (info) {
			const textHeight = getTextHeight();
			const available = info.size.width - info.ySize.width;
			const textSpacing = textHeight + getTextExtra(); // rotate does not actually rotate from the exact corner
			if (available < textSpacing) {
				throw new Error('not enough space');
			}
			const items = Math.floor(available / textSpacing); // the if guarantees at >=1
			afterScale.domain(domain(info))
				.range([0, available]);
			const newC = info.container.call(afterAxis.ticks(items));
			newC.selectAll('g.tick text').each(function () {
				(this as SVGGElement).setAttribute('transform', 'rotate(-45)');
				(this as SVGGElement).setAttribute('text-anchor', 'end');
			});
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const box = newC.node()!.getBBox();
			if (label) {
				return {
					height: box.height + getTextHeight(),
					width: box.width
				};
			}
			return box;
		},
		render: function (info) {
			const myHeight = info.xSize.height;
			const otherWidth = info.ySize.width;
			const textHeight = getTextHeight();
			const height = info.size.height;
			const available = info.size.width - info.ySize.width - (info.yRightSize?.width ? info.yRightSize.width : 0);
			const textSpacing = textHeight + getTextExtra(); // rotate does not actually rotate from the exact corner
			if (available < textSpacing) {
				throw new Error('not enough space');
			}
			const items = Math.floor(available / textSpacing); // the if guarantees at >=1
			afterScale.domain(domain(info))
				.range([0, available]);
			const newC = info.container
				.attr('transform', `translate(${otherWidth}, ${height - myHeight})`)
				.transition()
				.duration(info.anim)
				.call(afterAxis.ticks(showScale ? items : 0));
			newC.selectAll('g.tick text').each(function () {
				(this as SVGGElement).setAttribute('transform', 'rotate(-45)');
				(this as SVGGElement).setAttribute('text-anchor', 'end');
			});
			if (label) {
				info.container
					.selectAll('text.x-axis-label')
					.data([label()])
					.join('text')
					.classed('x-axis-label', true)
					.attr('fill', 'currentColor')
					.attr('text-anchor', 'middle')
					// rotated elements translate differently!
					.attr('transform', `rotate(0)translate(${available / 2}, ${myHeight})`)
					.transition()
					.duration(info.anim)
					.text(d => d);
			}
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			return newC.node()!.getBBox();
		}
	};
}