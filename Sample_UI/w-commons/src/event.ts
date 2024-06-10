import { DashboardHistogramChartField } from '@axioma/wealth-types';
import { TileHandler } from '@axioma-framework/qontum';

export type Circle = {
	anchor: string;
	arcColor: string;
	radius: number;
	fontSize: number;
	innerFontSize: number;

} & CircleData & CircleLocations;

export type CircleLocations = {
	x: number;
	y: number;
}
export type CircleData = {
	id: string;
	decimals: number;
	unit: string;
	prefix: string;
	maximum: number;
	minimum: number;
	type: 'negative' | 'positive'
	value: number;
	innerText: string;
}

export type HistogramChartClick<T extends DashboardHistogramChartField = DashboardHistogramChartField> = {
	field: T;
	range: [number, number];
	operation: 'append' | 'replace';
}

export type KeyMetricMapping = {
	'newAccounts': 'newAccount';
	'cashRaise': 'cashFlow';
	'cashDeficit': 'cashFlow';
	'compliance': 'compliance'
};

export const keyMetricMapping = <T extends Record<string, 'newAccount' | 'cashFlow' | 'compliance'>>(
	mapping: T
): Record<keyof T, 'newAccount' | 'cashFlow' | 'compliance'> => mapping;

export type KeyMetricClick = {
	key: keyof KeyMetricMapping;
	field: 'newAccount' | 'cashFlow' | 'compliance' | DashboardHistogramChartField;
};

export type IKeyMetric = { key: keyof KeyMetricMapping; } & TileHandler;
