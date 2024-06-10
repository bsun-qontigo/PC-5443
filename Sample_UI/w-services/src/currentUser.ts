import type { WealthWorkspaceSettingDTO } from './wealthWorkspaceSettingDTO';
export const currentUser = {
	emails: [] as string[],
	name: '',
	settings: {} as WealthWorkspaceSettingDTO & { unique: string },
	isAxiomaUser: (): boolean => { return currentUser.emails.some(item => item.includes('qontigo.com')) || currentUser.emails.some(item => item.includes('axioma.com')) || currentUser.emails.some(item => item.includes('simcorp.com')); }
};