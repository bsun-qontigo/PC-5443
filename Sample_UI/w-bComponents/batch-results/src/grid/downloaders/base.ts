import { Context } from '../type';

export abstract class BaseDownloader {
	public constructor(protected readonly context: Context) {

	}

	public abstract download(): void | Promise<void>;
}

