import { WealthConfig } from '@axioma/wealth-config';
import { fetcher } from '@axioma/wealth-services';
import { AnalyticsTSInputRO, AnalyticsTSResult } from '@axioma/wealth-models';
import { WealthAnalyticsTSInputRO, WealthAnalyticsTSResult } from '@axioma/wealth-types';
import { utils } from '@axioma/common';
import { applicationJson, contentType } from '@axioma-api/wealth-utils';
const { getShortStringFromDateTime, createDateTime } = utils.dateUtils;
class TimeSeriesController {

    private readonly baseUrl: string;
    public constructor() {
        let wealthUrl = WealthConfig.wealthUrl;
        if (wealthUrl.endsWith('/')) {
            wealthUrl = wealthUrl.slice(0, -1);
        }
        this.baseUrl = `${wealthUrl}/api/v1/timeseries/analytics`;
    }

    public getTimeSeries(strategy: string, account: string, request: WealthAnalyticsTSInputRO): Promise<WealthAnalyticsTSResult[]> {
        const convertedRequest = convertWealthAnalyticsTSInputRO(request);
        return fetcher.post<AnalyticsTSInputRO>(`${this.baseUrl}/${strategy}/${account}`, { body: JSON.stringify(convertedRequest), headers: { ...contentType(applicationJson) } })
            .then(v => v.json())
            .then(i => i.map(convertAnalyticsTSResult));
    }
}

export const timeSeriesControllerRegistry: TimeSeriesController = new TimeSeriesController();


function convertWealthAnalyticsTSInputRO(request: WealthAnalyticsTSInputRO): AnalyticsTSInputRO {
    const { startDate, endDate, ...rest } = request;
    return {
        ...rest,
        startDate: getShortStringFromDateTime(startDate),
        endDate: getShortStringFromDateTime(endDate)
    };
}
function convertAnalyticsTSResult(value: AnalyticsTSResult): WealthAnalyticsTSResult {
    const { rebalanceDate, ...rest } = value;
    return {
        ...rest,
        rebalanceDate: rebalanceDate ? createDateTime(rebalanceDate as string, 'yyyy-LL-dd') : undefined
    };
}

