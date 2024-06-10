import { Vue } from '@axioma/vue';

const ob = Vue.observable({
	batchId: '',
	handled: false
});

export function setter(batchId: string): void {
	ob.batchId = batchId + '@' + Date.now();
	ob.handled = false;
}

export function getter(): string | undefined {
	if (!ob.handled && ob.batchId) {
		return ob.batchId.substring(0, ob.batchId.indexOf('@'));
	}
}

export function watcher(): string | undefined {
	return ob.batchId;
}