export {createScaleBandAxis} from './scale';
export function domain<T extends { yDomain: string[] }>(info: T): string[] {
	return info.yDomain;
}
