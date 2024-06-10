
import { UnreachableError } from '@axioma/core';
import { WorkspaceStateController } from '@axioma/wealth-types';

let _controller: WorkspaceStateController;

export const stateManager = {
	setController(controller: WorkspaceStateController): void {
		if (_controller) {
			throw new UnreachableError('already initialized');
		}
		_controller = controller;
	},
	getController(): WorkspaceStateController | void {
		if (!_controller) {
			return;
		}
		return _controller;
	}
};