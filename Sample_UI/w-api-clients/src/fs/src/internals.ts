import { UserVars } from '@fullstory/browser';

type FS = typeof import('@fullstory/browser');
let fs: Promise<FS> | undefined;
let running = false;
const isLocalhost = location.origin === 'http://localhost:5000';

export function fsEvent(eventName: string, eventProperties: { [key: string]: unknown; }): void {
	if (fs && running) {
		fs.then(fullstory => running && fullstory.event(eventName, eventProperties));
	}
}

export function trySetVars(varScope: 'page', properties?: { [key: string]: unknown; } | undefined): void {
	if (fs && running) {
		fs.then(fullstory => running && fullstory.setVars(varScope, properties));
	}
}

export function trySetUserVars(customVars: UserVars): void {
	if (fs && running) {
		fs.then(fullstory => running && fullstory.setUserVars(customVars));
	}
}

export function trySetIdentity(name: string, customVars: UserVars): void {
	if (fs && running) {
		fs.then(fullstory => running && fullstory.identify(name, customVars));
	}
}

export function beginFS(): void {
	if (isLocalhost) {
		return;
	}

	if (!running) {
		running = true;
		if (fs) {
			fs.then(doRestart);
		} else {
			fs = import('@fullstory/browser').then(init);
		}
	}
}

function doRestart(fs: FS) {
	fs.restart();
}

function init(fs: FS) {
	fs.init({ orgId: '15MY3K' });
	return fs;
}
