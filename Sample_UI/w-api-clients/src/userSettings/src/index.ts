import { WealthConfig } from '@axioma/wealth-config';
import { responseHandler } from '@axioma/core';
import { fetcher } from '@axioma/wealth-services';

class UserSettingsController {

    private readonly baseUrl: string;
    public constructor() {
        let wealthUrl = WealthConfig.wealthUrl;
        if (wealthUrl.endsWith('/')) {
            wealthUrl = wealthUrl.slice(0, -1);
        }
        this.baseUrl = `${wealthUrl}/api/v1/user-settings`;
    }

    public getEula(): Promise<FetchResponse<void>> {
        return fetcher.get(`${this.baseUrl}/eula`)
            .then(value => responseHandler(value as Response));
    }

    public putEula(): Promise<FetchResponse<void>> {
        return fetcher.put(`${this.baseUrl}/eula`)
            .then(value => responseHandler(value as Response));
    }
}

export const userSettingsControllerRegistry: UserSettingsController = new UserSettingsController();