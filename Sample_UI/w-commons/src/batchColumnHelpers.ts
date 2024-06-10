import { userApplicationStateClientRegistry } from '@axioma-api/wealth-user-application-state';
import { SupportedUnitAnalytics, Unit, getUnitFromAnalytics } from './unit';
import * as d3 from 'd3';

export function getNumberCellRenderParams(columnKey: SupportedUnitAnalytics): QontumNumberFormatter {
	const unit = getUnitFromAnalytics(columnKey);
	switch (unit) {
		case Unit.INTEGER:
			return userApplicationStateClientRegistry.getFormatter('integer');
		case Unit.PERCENT:
			return userApplicationStateClientRegistry.getFormatter('percent');
		case Unit.CURRENCY:
			return userApplicationStateClientRegistry.getFormatter('currency');
		case Unit.NUMBER:
		default:
			return userApplicationStateClientRegistry.getFormatter('decimal');
	}
}

export function getFormatter(x: number | { valueOf(): number; }, col: SupportedUnitAnalytics, useD3 = true): string {
	const formatter = getNumberCellRenderParams(col);
	if (!useD3) {
		return formatter(x.valueOf());
	}
	if (formatter.formatterName === 'percent') {
		return formatter(x.valueOf());
	}
	return d3.format('.2s')(x);
}