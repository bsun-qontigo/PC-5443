import * as d3 from 'd3';
import { getTextHeight } from '../../hiddenRender';
import { ScaleBandAxisOptions, ScaleBandAxisRender } from '../../type-ext';
import { getTextExtra } from '../constants';

export function createScaleBandAxis<Extras extends {}>({ label, domain }: ScaleBandAxisOptions<Extras>): ScaleBandAxisRender<Extras> {
	const afterScale = d3.scaleBand();
	const afterAxis = d3.axisLeft(afterScale);
	return {
		scale: afterScale,
		axis: afterAxis,
		calc: function (info) {
			const otherHeight = info.xSize.height;
			const textHeight = getTextHeight() * 1.2;
			const height = info.size.height;
			const available = info.size.height - info.xSize.height;
			const textSpacing = textHeight + 2; // rotate does not actually rotate from the exact corner
			if (available < textSpacing) {
				throw new Error('not enough space');
			}
			afterScale.domain(domain(info))
				.range([height - otherHeight, 0])
				.padding(0.2);
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const box = info.container
				.node()!.getBBox();
			if (label) {
				return {
					height: box.height,
					width: box.width + getTextHeight() + getTextExtra(),
				};
			}
			return box;
		},
		render: function (info) {
			const myWidth = info.ySize.width;
			const otherHeight = info.xSize.height;
			const textHeight = getTextHeight() * 1.2;
			const height = info.size.height;
			const available = info.size.height - info.xSize.height;
			const textSpacing = textHeight + 2;
			if (available < textSpacing) {
				throw new Error('not enough space');
			}
			afterScale.domain(domain(info))
				.range([height - otherHeight, 0])
				.padding(0.2);
			info.container
				.attr('transform', `translate(${myWidth}, 0)`)
				.transition()
				.duration(info.anim);
			if (label) {
				info.container
					.selectAll('text.y-axis-label')
					.data([label()])
					.join('text')
					.classed('y-axis-label', true)
					.attr('fill', 'currentColor')
					.attr('text-anchor', 'middle')
					// rotated elements translate differently!
					.attr('transform', `rotate(-90)translate(-${available / 2},-${myWidth - textHeight})`)
					.transition()
					.duration(info.anim)
					.text(d => d);
			}
		}
	};
}

export type NumberYAxisOptions = {
	label?: () => string;
	mode?: () => 'int' | 'float';
}

export function scaleBandDomain<T extends { yDomain: string[] }>(info: T): string[] {
	return info.yDomain;
}