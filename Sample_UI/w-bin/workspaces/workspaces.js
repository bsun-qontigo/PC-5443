require('../colors');
const Workspace = require('./workspaceClass');
const { join, dirname } = require('path');
const { readdirSync: readdir, existsSync: exists, statSync: stats, readFileSync } = require('fs');
const packageJsonPath = require.resolve('../../package.json');
/** @type {{workspaces: string[]}} */
const packageJson = require(packageJsonPath);
const rootDir = dirname(packageJsonPath);
const all = loadWorkspaces(rootDir, packageJson).concat(loadLocalWorkspaces());

/**
 * @type {{
 * 	all: string[];
 *  originals: string[];
 *  tests: string[];
 *  packages: string[];
 * }}
 */
const exported = {};
module.exports = exported;
define(exported, 'all', all);
define(exported, 'originals', all.filter(i => !i.toLowerCase().includes('package')));
define(exported, 'tests', all.filter(i => i.toLowerCase().includes('package-tests')));
define(exported, 'packages', all.filter(i => i.toLowerCase().includes('packages')));

const classes = all.map(i => new Workspace(i));
Object.defineProperty(exported, 'classes', { value: classes, writable: false, configurable: false });
define(classes, 'all', classes);
define(classes, 'originals', classes.filter(i => i.isOriginal));
define(classes, 'tests', classes.filter(i => i.isTest && i.isOutput));
define(classes, 'packages', classes.filter(i => i.isOutput && !i.isTest));

function define(obj, name, arr) {
	Object.defineProperty(obj, name, {
		get: function () {
			return arr.slice();
		},
		set: function () {
			throw new Error(`Cannot override "${name}" workspaces`);
		},
		configurable: false,
	});
}

function loadWorkspaces(rootDir, packageJson) {
	if (!packageJson.workspaces) {
		return [];
	}
	return packageJson.workspaces.reduce((prev, cur) => {
		if (cur.endsWith('*')) {
			cur = cur.slice(0, -2);
			try {
				if (exists(join(rootDir, cur))) {
					readdir(join(rootDir, cur)).forEach(i => isDir(join(rootDir, cur, i)) && prev.push(join(cur, i)));
				}
			} catch (e) { console.warn(`Workspace ${cur} threw ${`"${e && e.message}"` || 'an error'} when reading`) }
		} else {
			prev.push(cur);
		}
		return prev;
	}, ['']).map(i => join(rootDir, i)).filter(Boolean);
}

function loadLocalWorkspaces() {
	if (rootDir !== process.cwd()) {
		const path = join(process.cwd(), 'package.json');
		return loadWorkspaces(process.cwd(), JSON.parse(readFileSync(path, 'utf8')))
	}

	return [];
}
function isDir(path) {
	return stats(path).isDirectory();
}
