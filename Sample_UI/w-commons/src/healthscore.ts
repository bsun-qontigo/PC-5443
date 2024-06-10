import { WealthExtendedBatchOptimizationEntryOutputRO } from '@axioma/wealth-types';
import type {  ICellRendererParams, CellClassParams } from '@axioma-types/grid-wrapper';

export function healthScoreDriverColumnBadge(value: ICellRendererParams<WealthExtendedBatchOptimizationEntryOutputRO> | CellClassParams<WealthExtendedBatchOptimizationEntryOutputRO>): WealthBadgeColor {
	return getBadge(value?.data?.analytics?.healthScore);
}

export function healthScoreColumnBadge(value: ICellRendererParams<WealthExtendedBatchOptimizationEntryOutputRO> | CellClassParams<WealthExtendedBatchOptimizationEntryOutputRO>): WealthBadgeColor {
	const healthScoreValue = value.value;
	return getBadge(healthScoreValue);
}

export function getBadge(value: number | undefined): WealthBadgeColor {
	switch (true) {
		case value && isNaN(value as number):
			return 'error';
		case value && value > 0.89:
			return 'success';
		case value && value > 0.1:
			return 'warning';
		case value && value > 0:
			return 'neutral';
		default:
			return 'no-style';
	}
}
export type WealthBadgeColor = 'info' | 'warning' | 'error' | 'success' | 'disabled' | 'no-style' | 'neutral';