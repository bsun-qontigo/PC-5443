import { fsEvent } from './internals';
type FSEventType = Record<string, number | boolean | string | undefined | string[] | number[]>
const FSTimeout = 2000;
let looping = false;
/**
 * Throttles the events (you can dispatch up to 30 events per minutes https://developer.fullstory.com/custom-events)
 * this function ensure that we send up most 1 event per 2 seconds
 */
export function sendFsEvent(eventName: string, ev: FSEventType): void {
	queue.put(eventName, ev);
	if (looping) {
		return;
	}
	beginSendloop();
}

function beginSendloop() {
	const item = queue.take();
	if (item) {
		fsEvent(item[0], item[1]);
		setTimeout(beginSendloop, FSTimeout);
	} else {
		looping = false;
	}
}

const queue = new class Queue {
	private _tail: ItemNode | null = null;
	private _head: ItemNode | null = null;

	public put(eventName: string, ev: FSEventType): void {
		if (this._tail) {
			this._tail = this._tail.next = {
				next: null,
				value: [eventName, ev]
			};
		} else {
			this._head = this._tail = {
				next: null,
				value: [eventName, ev]
			};
		}
	}

	public take(): [string, FSEventType] | undefined {
		if (this._head) {
			const val = this._head.value;
			this._head = this._head.next;
			if (!this._head) {
				this._tail = null;
			}
			return val;
		}
	}
};

type ItemNode = {
	value: [string, FSEventType]
	next: ItemNode | null;
};