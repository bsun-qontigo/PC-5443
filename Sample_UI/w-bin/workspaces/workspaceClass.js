// @ts-check
const { join } = require('path');
const { existsSync, readdirSync, statSync } = require('fs');
const readJsonSafe = require('./../readJson');
class Workspace {
	/**
	 * Creates a representation of the workspace
	 * @param {string} fullPath full path to the workspace
	 */
	constructor(fullPath) {
		this._fullpath = fullPath;
		this._isTest = !!arguments[1];
	}

	/**
	 * folder full path
	 */
	get fullPath() {
		return this._fullpath;
	}

	/**
	 * package.json full path
	 */
	get packageJsonPath() {
		const path = join(this._fullpath, 'package.json');
		if (!existsSync(path)) {
			throw new Error(`Could not find package json for "${path} "`);
		}
		return path;
	}

	/** tsconfig.json full path */
	get tsConfigPath() {
		const path = join(this._fullpath, 'tsconfig.json');
		if (!existsSync(path)) {
			throw new Error(`Could not find tsconfig json for "${path} "`);
		}
		return path;
	}

	/** package.json as an object */
	get packageJson() {
		return require(this.packageJsonPath);
	}

	/** typescript configuration */
	get tsConfig() {
		return readJsonSafe(this.tsConfigPath);
	}

	/** whether it has a tests folder */
	get hasTests() {
		return !!this.testsFolder;
	}

	/** test folder path */
	get testsFolder() {
		return getTestFolder(this.fullPath);
	}

	/** test project as an instance of this class */
	get testsWorkspace() {
		if (this.hasTests) {
			return new Workspace(this.testsFolder, true);
		}

		throw new Error(`Workspace "${this.name}" does not have a tests project`);
	}

	/** name of the project */
	get name() {
		return take(this, 'packageJson', 'name');
	}

	/** typescript output dir */
	get outDir() {
		return take(this, 'tsConfig', 'compilerOptions', 'outDir');
	}

	/** if the project is one of the originals (not the compiled ones) */
	get isOriginal() {
		return !this.fullPath.includes('package');
	}

	/** if its a tests project */
	get isTest() {
		return this.fullPath.includes('test');
	}

	/** if its the output of a project */
	get isOutput() {
		return !this.isOriginal;
	}
}

function take(obj, ...props) {
	return props.reduce(readProps, obj);
}

function readProps(obj, value) {
	return obj != undefined && obj[value];
}

module.exports = Workspace;
Object.getOwnPropertyNames(Workspace.prototype).forEach(memoize);

/**
 * Make getter cacheable
 * @param {string} getterName
 */
function memoize(getterName) {
	const original = Object.getOwnPropertyDescriptor(Workspace.prototype, getterName);
	const getter = original.get;
	if (!getter) {
		return;
	}
	Object.defineProperty(Workspace.prototype, getterName, Object.assign({}, original, { get }));
	const internalProp = Symbol('__' + getterName);
	function get() {
		if (internalProp in this) {
			if (this[internalProp].error) {
				throw this[internalProp].error;
			}
			return this[internalProp].value;
		}

		this[internalProp] = getValueOf(this, getter);
		return get.call(this);
	}
}

/**
 * @param {string} path current workspace folder
 */
function getTestFolder(path) {
	return readdirSync(path).find(isTestLikeFolder, path)
}

/**
 * @param {string} path current workspace folder
 */
function isTestLikeFolder(path) {
	return path.includes('test') && !path.includes('package') && statSync(join(this.toString(), path)).isDirectory();
}


const value = null, error = null;
function getValueOf(instance, originalFunction) {
	try {
		const value = deepFreeze(originalFunction.call(instance));
		return { error, value, };
	} catch (error) {
		return { error, value, };
	}
}

function deepFreeze(value) {
	if (value && typeof value === 'object') {
		for (let i in value) {
			if (i !== 'hasOwnProperty' && i !== 'constructor') {
				value[i] = deepFreeze(value);
			}
		}
		return Object.freeze(value);
	}

	return value;
}
