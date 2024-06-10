import { LONG_TIME } from '../../utils/src';
import { fetcher, onSignOut, WealthCachedMap } from '@axioma/wealth-services';
import { WealthConfig } from '@axioma/wealth-config';
import { AssetAnalyticsRO, ClassificationMappingRO, HoldingLotAnalyticsRO, InitialvsFinalAnalyticsRO, PortfolioDrillDownRO, TradeAnalyticsRO, TransactionLotAnalyticsRO } from '@axioma/wealth-models';
import { utils } from '@axioma/common';
import { ClassificationDTO, GroupByKey, WealthAssetAnalyticsRO, WealthHoldingLotAnalyticsRO, WealthInitialvsFinalAnalyticsRO, WealthPortfolioDrillDownRO, WealthTradeAnalyticsRO, WealthTransactionLotAnalyticsRO } from '@axioma/wealth-types';
import { DateTime } from 'luxon';
import { HttpStatusCodes } from '@axioma/core';
import { Unclassified } from '@axioma/wealth-commons';

const { getDateTimeFromAPI, dateFormatShort } = utils.dateUtils;
class PortfolioClient {

	protected readonly cache = new WealthCachedMap(LONG_TIME);
	private readonly baseUrl: string;
	public constructor() {
		let wealthUrl = WealthConfig.wealthUrl;
		if (wealthUrl.endsWith('/')) {
			wealthUrl = wealthUrl.slice(0, -1);
		}
		this.baseUrl = `${wealthUrl}/api/v1/drilldown`;
		onSignOut(this.clean.bind(this));
	}

	public getDrilldown(date: DateTime, strategyName: string, portfolioName: string): Promise<WealthPortfolioDrillDownRO> {
		return fetcher.post<PortfolioDrillDownRO>(`${this.baseUrl}/${dateFormatShort(date)}/${strategyName}/${portfolioName}`)
			.then(v => {
				const { status, headers } = v;
				if (status !== HttpStatusCodes.OK) {
					return v.json().then(response => ({
						status,
						headers,
						errors: response.errors
					}) as { status: HttpStatusCodes; errors?: unknown; data?: WealthPortfolioDrillDownRO });
				} else {
					return v.json().then(data => ({
						data,
						status: HttpStatusCodes.OK,
					}));
				}
			})
			.then(v => {
				if (v.status !== HttpStatusCodes.OK) {
					throw v;
				}
				return v.data;
			})
			.then(data => convertPortfolioDrillDownRO(data as PortfolioDrillDownRO));
	}

	private clean() {
		this.cache.clean();
	}
}

export const portfolioClientRegistry: PortfolioClient = new PortfolioClient();

export function getLevelName(depth: number): GroupByKey {
	return ['level', depth].join('@') as GroupByKey;
}

export function getLevelDepth(name: string): number {
	return Number.parseInt(name.split('@')[1], 10);
}

function convertHoldingLotAnalyticsRO(data: HoldingLotAnalyticsRO): WealthHoldingLotAnalyticsRO {
	const { buyDate, ...rest } = data;
	return {
		...rest,
		buyDate: getDateTimeFromAPI(buyDate)
	};
}

function convertTransactionLotAnalyticsRO(data: TransactionLotAnalyticsRO): WealthTransactionLotAnalyticsRO {
	const { buyDate, ...rest } = data;
	return {
		...rest,
		buyDate: getDateTimeFromAPI(buyDate)
	};
}

function convertAssetAnalyticsRO(classificationMappingRO: ClassificationMappingRO, data: AssetAnalyticsRO): WealthAssetAnalyticsRO {
	const { holdingLotAnalytics, assetId, ...rest } = data;
	const clsf = getClassifications(assetId as string, classificationMappingRO);
	return {
		assetId,
		classifications: { ...clsf },
		isUnclassified: clsf[getLevelName(1)] === Unclassified,
		...rest,
		holdingLotAnalytics: holdingLotAnalytics?.map(convertHoldingLotAnalyticsRO),
	};
}

function convertTradeAnalyticsRO(data: TradeAnalyticsRO): WealthTradeAnalyticsRO {
	const { transactionLotAnalytics, ...rest } = data;
	return {
		...rest,
		transactionLotAnalytics: transactionLotAnalytics?.map(convertTransactionLotAnalyticsRO),
	};
}

function convertInitialvsFinalAnalyticsRO(classificationMappingRO: ClassificationMappingRO, data: InitialvsFinalAnalyticsRO): WealthInitialvsFinalAnalyticsRO {
	const { assetId, ...rest } = data;
	const clsf = getClassifications(assetId as string, classificationMappingRO);
	return {
		assetId,
		classifications: { ...clsf },
		isUnclassified: clsf[getLevelName(1)] === Unclassified,
		...rest
	};
}

function getClassifications(assetId: string, classificationMappingRO: ClassificationMappingRO): Record<GroupByKey, string> {
	const levels = classificationMappingRO.levels ?? [] as string[];
	const mapping = classificationMappingRO.mapping ?? {} as Record<string, string[]>;
	const c = mapping[assetId];
	const result = {} as Record<GroupByKey, string>;
	if (c) {
		for (let i = 1; i < levels.length + 1; i++) {
			result[getLevelName(i)] = c[i - 1];
		}
	} else {
		for (let i = 1; i < levels.length + 1; i++) {
			result[getLevelName(i)] = Unclassified;
		}
	}
	return result;
}

function convertPortfolioDrillDownRO(data: PortfolioDrillDownRO): WealthPortfolioDrillDownRO {
	const { date, assetDetailsInitial, assetDetailsFinal, tradeDetails, assetDetailsInitialvsFinal, assetClassificationMap, ...rest } = data;
	const levels = assetClassificationMap?.levels ?? [];
	const classificationDTO = Array(levels.length).fill(null) as ClassificationDTO;
	for (let i = 1; i < levels.length + 1; i++) {
		classificationDTO[i - 1] = { key: getLevelName(i), name: levels[i - 1], i18nKey: levels[i - 1] /*TODO*/ };
	}
	return {
		classificationDTO,
		...rest,
		date: getDateTimeFromAPI(date),
		assetDetailsInitial: assetDetailsInitial?.map(convertAssetAnalyticsRO.bind(null, assetClassificationMap as ClassificationMappingRO)),
		assetDetailsFinal: assetDetailsFinal?.map(convertAssetAnalyticsRO.bind(null, assetClassificationMap as ClassificationMappingRO)),
		tradeDetails: tradeDetails?.map(convertTradeAnalyticsRO),
		assetDetailsInitialvsFinal: assetDetailsInitialvsFinal?.map(convertInitialvsFinalAnalyticsRO.bind(null, assetClassificationMap as ClassificationMappingRO)),
	};
}
