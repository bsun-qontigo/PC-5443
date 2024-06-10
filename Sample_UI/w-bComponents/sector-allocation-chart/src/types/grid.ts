import { getFigmaToken } from '@axioma/style-tokens';
import { AxisRender, ChartRender, ScaleBandAxisRender } from '../type-ext';
import { noTooltip } from './tooltip';

export function xGrid<Series, Extra extends {}>(): (x: AxisRender<Extra>, y: ScaleBandAxisRender<Extra>) => ChartRender<Series, Extra> {
	return function (x) {
		return noTooltip(function (info) {
			info.container
				.selectAll('line.y-grid')
				.data(x.scale.ticks(x.axis.tickArguments()[0]), (_, i) => i.toString())
				.join('line')
				.classed('y-grid', true)
				.transition()
				.duration(info.anim)
				.attr('x1', d => x.scale(d))
				.attr('x2', d => x.scale(d))
				.attr('y1', 0)
				.attr('y2', info.size.height)
				.attr('stroke', getFigmaToken('color-secondary-30'));
		});
	};
}
