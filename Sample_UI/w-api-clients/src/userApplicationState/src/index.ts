import { HttpStatusCodes, Debouncer } from '@axioma/core';
import { fetcher, onSignOut } from '@axioma/wealth-services';
import { WealthConfig } from '@axioma/wealth-config';
import { WealthUserDTO, UserJWT } from './wealthUserDTO';
import type { WorkspaceState, WorkspaceTabState } from '@axioma/wealth-types';
import { Vue } from '@axioma/vue';
import { EventEmitter } from 'events';
import { applicationJson, contentType, NumberFormatMode, numberFormatValues, type UserSettingsRegistry, type IWealthWorkspaceSetting } from '@axioma-api/wealth-utils';

export { WealthUserDTO, UserJWT };

export const defaultUserSettings = {
	theme: 'Light',
	decimalDigits: '2',
	percentDigits: '2',
	bpsDigits: '2',
	decimalCurrencyValue: '2',
	numberFormatValue: numberFormatValues[0],
} as const;

const wealthSettingsKey = 'wealth-settings';

class UserApplicationStateClient extends EventEmitter implements UserSettingsRegistry {

	protected user: WealthUserDTO = null as unknown as WealthUserDTO;
	private readonly baseUrl: string;
	private formatters: Record<NumberFormatMode, Intl.NumberFormat>;
	private privateFormatters: Record<QontumNumberFormatterName, QontumNumberFormatter>;
	private _settings: Promise<IWealthWorkspaceSetting> | null = null;
	private state: Promise<string> | null = null;
	private saveDebouncer: Debouncer;
	public constructor() {
		super();
		this.saveDebouncer = new Debouncer(1000, () => {
			this.state?.then(this.save);
		});
		this.privateFormatters = {
			'decimal': createFormatter(v => this.formatters.decimal.format(v), 'decimal'),
			'percent': createFormatter(v => this.formatters.percent.format(v / 100), 'percent'),
			'percent_no_symbol': createFormatter(v => this.formatters.percent.format(v / 100).replace('%', '').trim(), 'percent_no_symbol'),
			'bps': createFormatter(v => this.formatters.bps.format(v), 'bps'),
			'currency': createFormatter(v => this.formatters.currency.format(v), 'currency'),
			'integer': createFormatter(v => this.formatters.integer.format(v), 'integer'),
		};
		this.formatters = Vue.observable({
			decimal: new Intl.NumberFormat(numberFormatValues[0].culture, { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }),
			percent: new Intl.NumberFormat(numberFormatValues[0].culture, { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 }),
			percent_no_symbol: new Intl.NumberFormat(numberFormatValues[0].culture, { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 }),
			bps: new Intl.NumberFormat(numberFormatValues[0].culture, { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }),
			currency: new Intl.NumberFormat(numberFormatValues[0].culture, { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }),
			integer: new Intl.NumberFormat(numberFormatValues[0].culture)
		});
		let wealthUrl = WealthConfig.wealthUrl;
		if (wealthUrl.endsWith('/')) {
			wealthUrl = wealthUrl.slice(0, -1);
		}
		this.baseUrl = `${wealthUrl}/api/v1/user-application-state`;
		onSignOut(() => this.state = null);
	}

	public getWorkspaceSettings<TSettings>(): Promise<TSettings> {
		if (this._settings) {
			return this._settings.then(cloneSettings) as Promise<TSettings>;
		}
		this._settings = this.getByName(wealthSettingsKey)
			.then(i => JSON.parse(i.content as string) as IWealthWorkspaceSetting)
			.catch(err => this.handleWorkspaceSettingsError(err))
			.then(settings => {
				settings = cloneSettings(settings);
				const toCheck: { type: NumberFormatMode, value: string }[] = [
					{ type: 'decimal', value: settings.decimalDigits },
					{ type: 'percent', value: settings.percentDigits },
					{ type: 'bps', value: settings.bpsDigits },
					{ type: 'currency', value: settings.decimalCurrencyValue },
				];
				this.checkFormats(settings.numberFormatValue.culture, settings.numberFormatValue.culture, toCheck);
				return settings;
			});
		return this._settings as Promise<TSettings>;
	}

	public async saveWorkspaceSettings(settings: IWealthWorkspaceSetting): Promise<void> {
		let _settings: IWealthWorkspaceSetting = await this._settings as IWealthWorkspaceSetting;
		_settings = cloneSettings(_settings);
		const oldCulture = _settings.numberFormatValue.culture;
		return this.putByName(wealthSettingsKey, JSON.stringify(settings))
			.then(() => {
				this._settings = Promise.resolve(cloneSettings(_settings));
				const toCheck: { type: NumberFormatMode, value: string }[] = [
					{ type: 'decimal', value: settings.decimalDigits },
					{ type: 'percent', value: settings.percentDigits },
					{ type: 'bps', value: settings.bpsDigits },
					{ type: 'currency', value: settings.decimalCurrencyValue },
				];
				this.checkFormats(settings.numberFormatValue.culture, oldCulture, toCheck);
			});
	}

	public getDefaultWorkspaceSettings<IWealthWorkspaceSetting>(): Promise<IWealthWorkspaceSetting> {
		return Promise.resolve({
			...this.getDefaultStaticWorkspaceSettings()
		}) as Promise<IWealthWorkspaceSetting>;
	}

	public getDefaultStaticWorkspaceSettings<IWealthWorkspaceSetting>(): IWealthWorkspaceSetting {
		return { ...defaultUserSettings } as IWealthWorkspaceSetting;
	}
	public resetState(): Promise<object> {
		this.state = null;
		return fetcher.put(`${this.baseUrl}`, { body: JSON.stringify({}), headers: { ...contentType(applicationJson) } });
	}

	public getFormatter(type: QontumNumberFormatterName): QontumNumberFormatter {
		return this.privateFormatters[type];
	}

	public getState<T>(): Promise<{ items: T[] }> {
		if (!this.state) {
			this.state = this._getState()
				.then(state => {
					if (!state.items) {
						return JSON.stringify({ items: [] });
					} else {
						return JSON.stringify(state);
					}
				});
		}
		return this.state.then(JSON.parse).then(res => {
			const firstLogin = sessionStorage.getItem('FIRST_LOGIN');
			if (firstLogin === 'true') {
				sessionStorage.setItem('FIRST_LOGIN', 'false');
				return this.pruneStates(res);
			} else {
				return res;
			}
		});
	}

	public deleteByName(name: string): Promise<void> {
		return this.getState<WorkspaceTabState>()
			.then(currentState => {
				const byAppName = (i: WorkspaceTabState) => i.applicationName === name;
				const match = currentState.items.findIndex(byAppName);
				if (match >= 0) {
					currentState.items.splice(match, 1);
					return fetcher.put(`${this.baseUrl}`,
						{
							body: JSON.stringify(currentState),
							headers: {
								...contentType(applicationJson)
							}
						}).then(() => {
							this.state = Promise.resolve(JSON.stringify(currentState));
						});
				}
			});
	}

	public putByName(name: string, value: unknown): Promise<void> {
		if (!this.state) {
			this.state = null as unknown as Promise<string>;
		}
		this.state = this.state.then(txt => {
			const obj = JSON.parse(txt) as { items: WorkspaceTabState[] };
			const item = obj.items.find(i => i.applicationName === name);
			if (item) {
				item.content = value as unknown as string;
			}
			else {
				obj.items.push({
					applicationName: name,
					content: value as unknown as string
				});
			}
			this.saveDebouncer.tick();
			return JSON.stringify(obj);
		});
		return Promise.resolve();
	}

	private postState(request: string): Promise<object> {
		return fetcher.post(`${this.baseUrl}`, { body: request, headers: { ...contentType(applicationJson) } });
	}

	private getByName(name: string): Promise<WorkspaceTabState> {
		if (!this.state) {
			this.state = null as unknown as Promise<string>;
		}
		return this.state.then(txt => {
			const obj = JSON.parse(txt) as { items: WorkspaceTabState[] };
			const found = obj.items.find(i => i.applicationName === name);
			if (found) {
				return found;
			} else {
				throw new Error('State not found');
			}
		});
	}

	private save(txt: string): Promise<unknown> {
		return fetcher.put(`${WealthConfig.wealthUrl}/api/v1/user-application-state`, { body: txt, headers: { ...contentType(applicationJson) } })
			.then(v => {
				if (v.status === HttpStatusCodes.BAD_REQUEST) {
					return this.postState(txt);
				}
				return Promise.resolve(v);
			})
			.catch(() => this.postState(txt));
	}

	private _getState<T>(): Promise<{ items: T[] }> {
		return fetcher.get(`${this.baseUrl}`, { headers: { ...contentType(applicationJson) } })
			.then(v => {
				if (v.status === HttpStatusCodes.OK) {
					return v.json();
				} else {
					return Promise.resolve({ items: [] });
				}
			});
	}

	private handleWorkspaceSettingsError(_error: FetchResponse<unknown>): Promisify<IWealthWorkspaceSetting> {
		return this.getDefaultWorkspaceSettings()
			.then(content => {
				this.saveWorkspaceSettings(content as IWealthWorkspaceSetting);
				return content;
			}) as Promisify<IWealthWorkspaceSetting>;
	}

	private checkFormats(culture: string, oldCulture: string, toCheck: { type: QontumNumberFormatterName, value: string }[]) {
		const cultureChanged = culture !== oldCulture;
		if (cultureChanged) {
			toCheck.forEach(i => {
				if (i.type === 'decimal' && !isNaN(Number(i.value))) {
					this.formatters.decimal = new Intl.NumberFormat(culture, { style: 'decimal', minimumFractionDigits: Number(i.value), maximumFractionDigits: Number(i.value) });
				}
				if (i.type === 'percent' && !isNaN(Number(i.value))) {
					this.formatters.percent = new Intl.NumberFormat(culture, { style: 'percent', minimumFractionDigits: Number(i.value), maximumFractionDigits: Number(i.value) });
				}
				if (i.type === 'bps' && !isNaN(Number(i.value))) {
					this.formatters.bps = new Intl.NumberFormat(culture, { style: 'decimal', minimumFractionDigits: Number(i.value), maximumFractionDigits: Number(i.value) });
				}
				if (i.type === 'currency' && !isNaN(Number(i.value))) {
					this.formatters.currency = new Intl.NumberFormat(culture, { style: 'decimal', minimumFractionDigits: Number(i.value), maximumFractionDigits: Number(i.value) });
				}
			});
		} else {
			toCheck.forEach(i => {
				if (i.type === 'decimal' && !isNaN(Number(i.value)) && this.formatters.decimal.resolvedOptions().maximumFractionDigits !== Number(i.value)) {
					this.formatters.decimal = new Intl.NumberFormat(culture, { style: 'decimal', minimumFractionDigits: Number(i.value), maximumFractionDigits: Number(i.value) });
				}
				if (i.type === 'percent' && !isNaN(Number(i.value)) && this.formatters.percent.resolvedOptions().maximumFractionDigits !== Number(i.value)) {
					this.formatters.percent = new Intl.NumberFormat(culture, { style: 'percent', minimumFractionDigits: Number(i.value), maximumFractionDigits: Number(i.value) });
				}
				if (i.type === 'bps' && !isNaN(Number(i.value)) && this.formatters.bps.resolvedOptions().maximumFractionDigits !== Number(i.value)) {
					this.formatters.bps = new Intl.NumberFormat(culture, { style: 'decimal', minimumFractionDigits: Number(i.value), maximumFractionDigits: Number(i.value) });
				}
				if (i.type === 'currency' && !isNaN(Number(i.value)) && this.formatters.currency.resolvedOptions().maximumFractionDigits !== Number(i.value)) {
					this.formatters.currency = new Intl.NumberFormat(culture, { style: 'decimal', minimumFractionDigits: Number(i.value), maximumFractionDigits: Number(i.value) });
				}
			});
		}
	}

	private pruneStates(states: { items: WorkspaceState[] }): { items: WorkspaceState[] } {
		const items = states.items ?? [];
		for (let i = items.length; i >= 0; i--) {
			const item = items[i] as WorkspaceTabState;
			const content = item?.content as { state?: { module?: string }, tabs?: { module?: string }[] };
			if (content && content.tabs && content.tabs.length > 0) {
				content.tabs.forEach((tab, idx) => {
					if (tab.module === '@axioma-apps/portfolio-tab') {
						content.tabs?.splice(idx, 1);
					}
				});
			}
			if (content && content.state?.module === '@axioma-apps/portfolio-tab') {
				items.splice(i, 1);
			}
		}
		return states;
	}
}

export const userApplicationStateClientRegistry: UserApplicationStateClient = new UserApplicationStateClient();

function cloneSettings(settings: IWealthWorkspaceSetting | null): IWealthWorkspaceSetting {
	if (settings) {
		return {
			bpsDigits: settings.bpsDigits,
			theme: settings.theme,
			decimalCurrencyValue: settings.decimalCurrencyValue,
			decimalDigits: settings.decimalDigits,
			percentDigits: settings.percentDigits,
			numberFormatValue: settings.numberFormatValue,
		};
	} else {
		return defaultUserSettings;
	}
}

function createFormatter(f: (value: number) => string, name: QontumNumberFormatterName): QontumNumberFormatter {
	const fn = f as QontumNumberFormatter;
	fn.formatterName = name;
	return fn;
}
