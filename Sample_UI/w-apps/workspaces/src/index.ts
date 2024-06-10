import Template from './template.vue';
import { Component, Vue, Provide, tryEndApp } from '@axioma/vue';
import Header from '@axioma-components/header';
import { AxSpinner } from '@axioma/components';
// TODO export isLayoutState & isTabState from idUtils?
import { WorkspaceController, createWorkspaces, LayoutManager, TabItem } from '@axioma-framework/layout';
import { userApplicationStateClientRegistry } from '@axioma-api/wealth-user-application-state';
import { currentUser, stateManager, WealthWorkspaceSettingDTO } from '@axioma/wealth-services';
import { changeTheme, types } from '@axioma/common';
import { WorkspaceState, WorkspaceStateController } from '@axioma/wealth-types';
import type { PortfolioTabExpectations } from '@axioma-components/wealth-portfolio-tab';
import { HttpStatusCodes, notificationsService, Deferred, noop } from '@axioma/core';
import { createModal } from '@axioma-framework/qontum';
import DisclaimerAgreement from './views/disclaimer-agreement';
import DisclaimerAgreementUpdated from './views/disclaimer-agreement-updated';
import { fsOpenApp, fsOpenHome, fsTheme } from './utils/fsEvents';
import { userSettingsControllerRegistry } from '@axioma-api/wealth-user-settings';
import DemoComponents from '@axioma-components/wealth-demo-components';

type first = 0;
type OpenTab = ReturnType<Parameters<typeof createWorkspaces>[first]['noContent']> extends Promise<infer K> ? K : never;
const stateReady = new Deferred<void>();
const processingStatusAppModuleName = '@axioma-apps/wealth-processing-status';
const portfolioTabAppModuleName = '@axioma-apps/portfolio-tab';

@Component({
	components: {
		AxSpinner,
		Header,
		DemoComponents
	}
})
export default class WealthWorkspace extends Vue.extend(Template) {
	protected loading = false;
	protected controller!: Promise<WorkspaceController>;
	protected deferred?: Deferred<OpenTab>;
	protected isLoggedIn = false;
	private selectHome?: () => void;

	@Provide()
	public openApp(id: string, name: string, state?: Record<string, unknown>): void {
		fsOpenApp(name);
		this.controller.then(({ currentLayout }) => {
			isAppOpen(currentLayout, id, state).then((isOpen): Promise<unknown> | undefined => {
				if (isOpen) {
					return;
				}

				return currentLayout.newTab({
					module: id,
					defaultName: () => name,
					initialState: { state }
				});
			});
		});
	}

	protected created(): void {

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		// if(!(window as any).electronAPI) {
		// 	alert('must run in electron!');
		// }


		// if (checkForgotPasswordFlow()) {
		// 	return;
		// }
		// signIn(() => {
		// 	this.eulaCheck()
		// 		.then(res => {
		// 			if ((res as unknown as FetchResponse<void>).status === HttpStatusCodes.NO_CONTENT || (res as unknown as FetchResponse<void>).status === HttpStatusCodes.OK) {
		// 				this.isLoggedIn = true;
		// 			} else {
		// 				this.isLoggedIn = false;
		// 				this.logout();
		// 			}
		// 		});
		// });
		// onSignOut(async () => {
		// 	if (this.controller) {
		// 		return this.controller.then(async (controller) => {
		// 			const tabs = await controller.currentLayout.list();
		// 			tabs.filter(tab => tab.renderedModule === '@axioma-apps/portfolio-tab').forEach(tab => {
		// 				(controller.currentLayout as LayoutManager & Record<'closeTab', Function>).closeTab(tab);
		// 			});
		// 		});
		// 	}
		// });
	}

	protected mounted(): void {
		// temp workaround for APP-6096 until we can disable/provide custom tooltip;
		const style = document.createElement('style');
		style.textContent = `.qontum-tooltip-container {
			display: none !important;
		}`;
		document.head.appendChild(style);
	}

	protected openProcessingStatus(state?: { strat: string }): void {
		this.openApp(processingStatusAppModuleName, this.$t('PROCESSING_STATUS').toString(), state);
	}

	protected saveUserSettings(): void {
		this.controller
			.then(() => userApplicationStateClientRegistry.saveWorkspaceSettings(currentUser.settings))
			.then(() => userApplicationStateClientRegistry.emit('userSettingSettingUpdated'));
	}

	protected resetUserSettings(): void {
		this.controller
			.then(() => userApplicationStateClientRegistry.resetState())
			.then(() => window.location.reload())
			.catch(/** TODO error*/);
	}

	protected showWealthHomeApp(): void {
		fsOpenHome();
		this.selectHome?.();
	}

	protected headerMounted(): void {
		const changeThemeProm = userApplicationStateClientRegistry.getWorkspaceSettings().then(ws => {
			currentUser.settings = ws as WealthWorkspaceSettingDTO;
			const theme = currentUser.settings.theme;
			fsTheme(theme);
			if (theme === 'Dark') {
				changeTheme('dark');
			} else if (theme === 'Light') {
				changeTheme('light');
			} else {
				changeTheme('system');
			}
		});

		changeThemeProm
			.finally(() => {
				stateReady.resolve();
			});
	}

	protected createWorkspaceController(tabsContainer: HTMLElement): Promise<WorkspaceController> {
		const tableContainer = this.$refs.tableContainer as HTMLElement;

		this.controller = createWorkspaces({
			headerContainer: tabsContainer,
			parent: this,
			contentContainer: tableContainer,
			home: selectHome => {
				this.selectHome = selectHome;
				return Promise.resolve('@axioma-apps/wealth');
			},
			selectionChanged: noop,
			lastItemClosing: noop,
			list<T>(): Promise<{ items: T[] }> {
				return userApplicationStateClientRegistry.getState<WorkspaceState>() as Promise<{ items: T[] }>;
			},
			delete(id: string): Promise<void> {
				return userApplicationStateClientRegistry.deleteByName(id);
			},
			save(id: string, content: unknown): Promise<void> {
				return userApplicationStateClientRegistry.putByName(id, content);
			},
			noContent: () => Promise.resolve({
				module: processingStatusAppModuleName,
				defaultName: () => 'Processing Status',
				initialState: {}
			}),
			tabContextMenu: (appId: string, _tab: TabItem) => {
				if (AppsOpenUnique.includes(appId) || appId === portfolioTabAppModuleName) {
					return Promise.resolve<types.TabContextMenuItem[]>(['refresh', 'close']);
				} else {
					return Promise.resolve(['refresh', 'clone', 'close']);
				}
			},
			getAppInfo: (id: string) => {
				return Promise.resolve({
					id,
					name: id
				});
			}
		})
			.then(controller => {
				stateManager.setController(controller as WorkspaceStateController);
				(window as unknown as { __controller: unknown }).__controller = controller;
				return controller;
			});
		return this.controller;
	}

	protected removeAllChilds(container: HTMLElement): void {
		let child = container.lastElementChild;
		while (child) {
			container.removeChild(child);
			child = container.lastElementChild;
		}
	}

	private logout(): void {
		tryEndApp();
		changeTheme('light');
	}

	private eulaCheck() {
		return userSettingsControllerRegistry
			.getEula()
			.catch(err => {
				if (err.status === HttpStatusCodes.BAD_REQUEST) {
					return createModal({
						component: DisclaimerAgreement,
						contentClass: 'modal-md-fixed',
						parent: this,
						propsData: {
							eulaText: err.body.eulaText
						}
					}).catch(failed);
				} else if (err.status === HttpStatusCodes.NOT_ACCEPTABLE) {
					return createModal({
						component: DisclaimerAgreementUpdated,
						contentClass: 'modal-md-fixed',
						parent: this,
						propsData: {
							eulaText: err.body.eulaText
						}
					}).catch(failed);
				} else if (err.status === HttpStatusCodes.UNAUTHORIZED) {
					this.logout();
				} else {
					notificationsService.notificationsServiceRegistry.notifyHttpErrors(err);
					this.logout();
					throw err;
				}
			});
	}
}
const AppsOpenUnique: string[] = [processingStatusAppModuleName];
function isAppOpen(currentLayout: LayoutManager, id: string, state?: Record<string, unknown>): Promise<boolean> {
	const modById = (j: TabItem) => j.renderedModule === id;
	const isPortfolioTabOpen = (): Promise<boolean> => {
		return currentLayout.list().then(i => {
			const openedPortfolioTabs = i.filter(modById);
			for (const pfTab of openedPortfolioTabs) {
				const s = (pfTab.getState()?.state ?? {}) as PortfolioTabExpectations['data'];
				if (s.portfolioName === state?.portfolioName && s.strategyName === state?.strategyName) {
					pfTab.select();
					return true;
				}
			}
			return false;
		});
	};
	if (id === portfolioTabAppModuleName) {
		return isPortfolioTabOpen();
	} else if (!AppsOpenUnique.includes(id)) {
		return Promise.resolve(false);
	} else {
		return currentLayout.list().then(i => {
			const tab = i.find(modById);
			if (tab) {
				tab.select();
				return true;
			}
			return false;
		});
	}
}

function failed(err: unknown) {
	notificationsService.notificationsServiceRegistry.notifyHttpErrors(err);
	throw err;
}
