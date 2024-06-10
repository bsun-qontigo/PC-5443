import { applicationJson, contentType, LONG_TIME } from '../../utils/src';
import { fetcher, onSignOut, WealthCachedMap } from '@axioma/wealth-services';
import { utils } from '@axioma/common';
import { DateTime } from 'luxon';
import { WealthConfig } from '@axioma/wealth-config';
import { WealthBatchStrategiesRO, WealthExtendedBatchOptimizationEntryOutputRO, ExtendedBatchOptimizationEntryOutputRO, WealthBatchJobRO } from '@axioma/wealth-types';
import { AccountNamesInputRO, BatchJobRO, BatchStrategiesRO, TradeRO } from '@axioma/wealth-models';

const { getDateTimeFromAPI, dateFormatShort, getDateTimeFromIso } = utils.dateUtils;

class WealthTaskClient {

	protected readonly cache = new WealthCachedMap(LONG_TIME);
	private readonly baseUrl: string;
	public constructor() {
		let wealthUrl = WealthConfig.wealthUrl;
		if (wealthUrl.endsWith('/')) {
			wealthUrl = wealthUrl.slice(0, -1);
		}
		this.baseUrl = `${wealthUrl}/api/v1/tasks`;
		onSignOut(this.clean.bind(this));
	}

	public getResultsByStrategyNameAndDate(strategyName: string, date: DateTime, portfolioName?: string): Promise<WealthExtendedBatchOptimizationEntryOutputRO[]> {
		const _getResultsByStrategyNameAndDate = () => this._getResultsByStrategyNameAndDate(strategyName, dateFormatShort(date), portfolioName);
		return this.cache.get(`/${date}/${strategyName}/results?showAnalyticsResultsOnly=true`, _getResultsByStrategyNameAndDate);
	}

	public getResultsByBatchId(batchId: string): Promise<WealthExtendedBatchOptimizationEntryOutputRO[]> {
		const _getResultsByBatchId = () => this._getResultsByBatchId(batchId);
		return this.cache.get(`${batchId}/results?showAnalyticsResultsOnly=true`, _getResultsByBatchId);
	}

	public getUniqueStrategyNames(): Promise<WealthBatchStrategiesRO> {
		return fetcher.get<BatchStrategiesRO>(`${this.baseUrl}/strategies`)
			.then(v => v.json())
			.then(v => convertBatchStrategiesRO(v));
	}

	public getBatchJobsByDate(date: DateTime): Promise<WealthBatchJobRO[]> {
		return fetcher.get<BatchJobRO[]>(`${this.baseUrl}/${dateFormatShort(date)}`)
			.then(v => v.json() as Promise<BatchJobRO[]>)
			.then(v => v.map(convertBatchJobRO));
	}

	public postBatchJobs(file: File): Promise<unknown> {
		const formData = new FormData();
		formData.append('file', file);
		return fetcher.post<File[]>(`${this.baseUrl}`, { 'body': formData });
	}

	public getTradeList(strategyName: string, date: DateTime, accountNames: string[]): Promise<Record<string, TradeRO[]>> {
		return fetcher.post(`${this.baseUrl}/${strategyName}/${dateFormatShort(date)}/tradeList`, { body: JSON.stringify({ accountNames } as AccountNamesInputRO), headers: { ...contentType(applicationJson) } })
			.then(v => v.json() as Promise<Record<string, TradeRO[]>>);
	}

	public rerunBatchJobs(strategyName: string, file: File): Promise<unknown> {
		const formData = new FormData();
		formData.append('file', file);
		return fetcher.post<File[]>(`${this.baseUrl}/${strategyName}/rerun`, { 'body': formData });
	}

	private _getResultsByStrategyNameAndDate(strategyName: string, date: string, portfolioName?: string): Promise<WealthExtendedBatchOptimizationEntryOutputRO[]> {
		let targetUrl: string;
		if (portfolioName) {
			targetUrl = `${this.baseUrl}/${date}/${strategyName}/results?account=${portfolioName}&showAnalyticsResultsOnly=true`;
		} else {
			targetUrl = `${this.baseUrl}/${date}/${strategyName}/results?showAnalyticsResultsOnly=true`;
		}
		return fetcher.get<ExtendedBatchOptimizationEntryOutputRO[]>(targetUrl)
			.then(v => v.json() as Promise<ExtendedBatchOptimizationEntryOutputRO[]>)
			.then(v => v.map(convertExtendedBatchOptimizationEntryOutputRO));
	}

	private _getResultsByBatchId(batchId: string): Promise<WealthExtendedBatchOptimizationEntryOutputRO[]> {
		return fetcher.get<ExtendedBatchOptimizationEntryOutputRO[]>(`${this.baseUrl}/${batchId}/results?showAnalyticsResultsOnly=true`)
			.then(v => v.json() as Promise<ExtendedBatchOptimizationEntryOutputRO[]>)
			.then(v => v.map(convertExtendedBatchOptimizationEntryOutputRO));
	}
	private clean() {
		this.cache.clean();
	}
}

export const wealthTaskClientRegistry: WealthTaskClient = new WealthTaskClient();

function convertExtendedBatchOptimizationEntryOutputRO(val: ExtendedBatchOptimizationEntryOutputRO): WealthExtendedBatchOptimizationEntryOutputRO {
	return Object.assign(val, {
		// date field might be removed in the future;
		date: getDateTimeFromAPI(val.date),
		lastTrade: getDateTimeFromAPI(val.lastTrade as unknown as string)
	} as Required<Pick<WealthExtendedBatchOptimizationEntryOutputRO, 'date' | 'lastTrade'>>);
}

function convertBatchStrategiesRO(val: BatchStrategiesRO): WealthBatchStrategiesRO {
	return Object.assign(val, {
		date: getDateTimeFromAPI(val.date)
	});
}

function convertBatchJobRO(val: BatchJobRO): WealthBatchJobRO {
	return Object.assign<BatchJobRO, WealthBatchJobRO>(val, {
		batchDate: getDateTimeFromAPI(val.batchDate),
		createdAt: getDateTimeFromIso(val.createdAt)
	});
}