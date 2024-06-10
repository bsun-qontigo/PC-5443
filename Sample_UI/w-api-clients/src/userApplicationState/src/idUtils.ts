import { TabState } from '@axioma-framework/layout';

// TODO export from gallery?
export type State<T> = {
	applicationName: string;
	content: T;
}
export type LayoutsState = {
	id: number;
	lud: number;
	name: string;
	tabs: TabState[];
}

const NEW_WORKSPACE = '@qw';
const WORKSPACE = 'w';
const TAB = 't';

export function isLayoutState(obj: State<object>): obj is State<LayoutsState> {
	return obj.applicationName.startsWith(NEW_WORKSPACE + WORKSPACE);
}

export function isTabState(obj: State<object>): boolean {
	return obj.applicationName.startsWith(NEW_WORKSPACE + TAB);
}