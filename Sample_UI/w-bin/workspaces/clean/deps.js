const clean = require('.');
const all = require('../workspaces').originals;
const join = require('path').join;
all.forEach(workspace => {
	clean(join(workspace, 'node_modules'));
});