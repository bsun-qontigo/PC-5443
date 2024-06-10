import { Debouncer } from '@axioma/core';
const CACHED_MAP_DEFAUL_TIMEOUT = 10;
const caches = new Set<WealthCachedMap>();

export class WealthCachedMap {
	protected _map: Record<string, Function> = {};

	public constructor(protected _timeout: number = CACHED_MAP_DEFAUL_TIMEOUT) {
		caches.add(this);
	}

	public dispose(): void {
		caches.delete(this);
	}

	public clean(): void {
		this._map = {};
	}

	public remove(key: string): void {
		delete this._map[key];
	}

	public getFor<T extends Promise<unknown> = Promise<unknown>>(timeout: number, key: string, generator: (key: string) => T): T {
		let val = this._map[key];
		if (val) {
			return val() as T;
		}

		const inner = generator(key);

		if (timeout === Infinity) {
			val = this._map[key] = () => inner;
		} else {
			const tick = new Debouncer(timeout, () => delete this._map[key]).tick;
			val = this._map[key] = () => {
				tick();
				return inner;
			};
		}

		return val() as T;
	}

	public get<T extends Promise<unknown> = Promise<unknown>>(key: string, generator: (key: string) => T): T {
		return this.getFor(this._timeout, key, generator);
	}
}

export function clearCaches(): void {
	caches.forEach(clear);
}

function clear(map: WealthCachedMap) {
	map.clean();
}
