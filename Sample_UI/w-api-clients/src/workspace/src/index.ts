import { getBody, LONG_LONG_TIME } from '@axioma-api/wealth-utils';
import { fetcher, onSignOut, WealthCachedMap } from '@axioma/wealth-services';
import { WealthConfig } from '@axioma/wealth-config';
import { WealthBatchSharedDataRO, WealthBatchWorkspaceArchiveFileTaskStatusRO, WealthRebalancingConfigurationRO } from '@axioma/wealth-types';
import { BatchSharedDataRO, BatchWorkspaceArchiveFileRequestRO, BatchWorkspaceArchiveFileTaskStatusRO, RebalancingConfigurationRO } from '@axioma/wealth-models';
import { utils } from '@axioma/common';
import { DateTime } from 'luxon';
import { HttpStatusCodes } from '@axioma/core';

const { getDateTimeFromAPI, getDateTimeFromIso } = utils.dateUtils;
class WealthWorkspaceClient {

	protected readonly cache = new WealthCachedMap(LONG_LONG_TIME);
	private readonly baseUrl: string;
	public constructor() {
		let wealthUrl = WealthConfig.wealthUrl;
		if (wealthUrl.endsWith('/')) {
			wealthUrl = wealthUrl.slice(0, -1);
		}
		this.baseUrl = `${wealthUrl}/api/v1`;
		onSignOut(this.clean.bind(this));
	}

	public getWorkspaceBy(request: { workspaceId: string; date: DateTime; strategy: string; portfolio: string }): Promise<BlobPart> {
		const _getWorkspaceBy = () => this._getWorkspaceBy(request);
		return this.cache.get(`workspaces/${request.workspaceId}.wsp`, _getWorkspaceBy);
	}
	public getArchiveStatus(requestId: string): Promise<WealthBatchWorkspaceArchiveFileTaskStatusRO> {
		return fetcher.get<BatchWorkspaceArchiveFileTaskStatusRO>(`${this.baseUrl}/workspaces/archives/${requestId}/status`)
			.then(v => v.json())
			.then(v => convertBatchWorkspaceArchiveFileTaskStatusRO(v));
	}

	public getAllArchivesStatus(): Promise<Array<WealthBatchWorkspaceArchiveFileTaskStatusRO>> {
		return fetcher.get<BatchWorkspaceArchiveFileTaskStatusRO>(`${this.baseUrl}/workspaces/archives/status`)
			.then(v => v.json())
			.then(v => v.map(convertBatchWorkspaceArchiveFileTaskStatusRO));
	}

	public cancelDownloadRequest(requestId: string): Promise<unknown> {
		return fetcher.put(`${this.baseUrl}/workspaces/archives/${requestId}/cancel`)
			.then(getBody);
	}

	public shareData(assetMapName: string): Promise<WealthBatchSharedDataRO> {
		return fetcher.post<BatchSharedDataRO>(`${this.baseUrl}/workspaces/sharedData`, { body: assetMapName })
			.then(v => v.json())
			.then(v => v.map(convertBatchSharedDataRO));
	}

	public archives(request: BatchWorkspaceArchiveFileRequestRO): Promise<unknown> {
		return fetcher.post<BatchWorkspaceArchiveFileRequestRO>(`${this.baseUrl}/workspaces/archives`, fetcher.bodyAsJson(request));
	}

	public account(rebalancingName: string, assetMapName: string): Promise<WealthRebalancingConfigurationRO> {
		return fetcher.post<RebalancingConfigurationRO>(`${this.baseUrl}/workspaces/account`, {
			body: JSON.stringify({
				rebalancingName,
				assetMapName
			})
		})
			.then(v => v.json())
			.then(v => convertRebalancingConfigurationRO(v));
	}


	private _getWorkspaceBy({ workspaceId, date, strategy, portfolio }: { workspaceId: string; date: DateTime; strategy: string; portfolio: string }): Promise<BlobPart> {
		return fetcher.get<string>(`${this.baseUrl}/workspaces/${utils.dateUtils.dateFormatShort(date)}/${strategy}/${portfolio}/${workspaceId}`, { headers: { 'Content-Type': 'application/xml' } })
			.then(v => {
				return v.text().then(text => {
					if (v.status === HttpStatusCodes.OK) {
						return { status: v.status, text };
					} else {
						throw new Error(text);
					}
				});
			})
			.then(v => v.text);
	}
	private clean() {
		this.cache.clean();
	}
}

export const wealthWorkspaceClientRegistry: WealthWorkspaceClient = new WealthWorkspaceClient();

function convertDateField(date: string): DateTime | undefined {
	return getDateTimeFromAPI(date);
}

function convertBatchSharedDataRO(val: BatchSharedDataRO): WealthBatchSharedDataRO {
	return Object.assign<BatchSharedDataRO, WealthBatchSharedDataRO>(val, {
		groups: val.groups ? val.groups.map(group => ({
			...group,
			date: group.date ? convertDateField(group.date) : undefined,
		})) : [],
		metagroups: val.metagroups ? val.metagroups.map(metagroup => ({
			...metagroup,
			date: metagroup.date ? convertDateField(metagroup.date) : undefined,
		})) : [],
		contentBuilderGroups: val.contentBuilderGroups ? val.contentBuilderGroups.map(contentBuilderGroup => ({
			...contentBuilderGroup,
			date: contentBuilderGroup.date ? convertDateField(contentBuilderGroup.date) : undefined,
		})) : [],
		contentBuilderScalars: val.contentBuilderScalars ? val.contentBuilderScalars.map(contentBuilderScalar => ({
			...contentBuilderScalar,
			date: contentBuilderScalar.date ? convertDateField(contentBuilderScalar.date) : undefined,
		})) : [],
		scalarGroupings: val.scalarGroupings ? val.scalarGroupings.map(scalarGrouping => ({
			...scalarGrouping,
			date: scalarGrouping.date ? convertDateField(scalarGrouping.date) : undefined,
		})) : [],
		costModels: val.costModels ? val.costModels.map(costModel => ({
			...costModel,
			date: costModel.date ? convertDateField(costModel.date) : undefined,
		})) : [],
		assetSets: val.assetSets ? val.assetSets.map(assetSet => ({
			...assetSet,
			date: assetSet.date ? convertDateField(assetSet.date) : undefined,
		})) : [],
		strategy: val.strategy ? {
			...val.strategy,
			date: val.strategy.date ? convertDateField(val.strategy.date) : undefined
		} : undefined
	});
}

function convertRebalancingConfigurationRO(val: RebalancingConfigurationRO): WealthRebalancingConfigurationRO {
	return Object.assign<RebalancingConfigurationRO, WealthRebalancingConfigurationRO>(val, {
		account: val.account ? {
			...val.account,
			date: val.account.date ? convertDateField(val.account.date) : undefined
		} : undefined
	});
}

function convertBatchWorkspaceArchiveFileTaskStatusRO(val: BatchWorkspaceArchiveFileTaskStatusRO): WealthBatchWorkspaceArchiveFileTaskStatusRO {
	return Object.assign<BatchWorkspaceArchiveFileTaskStatusRO, WealthBatchWorkspaceArchiveFileTaskStatusRO>(val, {
		startTime: val.startTime ? getDateTimeFromIso(val.startTime as unknown as string) : undefined,
		endTime: val.endTime ? getDateTimeFromIso(val.endTime as unknown as string) : undefined,
	});
}