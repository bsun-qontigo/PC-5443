// @ts-nocheck
/// <reference path="types.d.ts" />
const spawn = require('child_process').spawn;
const assertJava = require('./checkJava');
const promisify = require('util').promisify;
const fs = require('fs');
const rename = promisify(fs.rename);
const readdir = promisify(fs.readdir);
const mkdir = promisify(fs.mkdir);
const stat = promisify(fs.stat);
const { resolve, join } = require('path');
const swaggerDefs = require('./swaggers');
swaggerDefs.reduce(async function (prev, { name, args }) {
	const [spawnExtraArgs] = await Promise.all([args(), prev]);

	return new Promise(function (resolve, reject) {
		const chunkErrors = [];
		const child = spawn('java', [
			'-jar',
			`-Dmodels`,
			'-DsupportingFiles',
			'swagger-codegen-cli-3.0.40.jar',
			'generate',
			'-l',
			'typescript-angular',
			'-o',
			getOutFolder(name)
		].concat(spawnExtraArgs), {
			shell: true,
			cwd: __dirname,
			stdio: 'pipe'
		});
		child.on('exit', function (code) {
			if (code) {
				reject(chunkErrors.join(''));
			} else {
				resolve();
			}
		});
		const pusher = chunkErrors.push.bind(chunkErrors);
		child.stderr.on('data', pusher)
		child.stdout.on('data', pusher)
		child.on('error', reject);
	});
}, assertJava()).then(function () {
	fs.rmSync(join(__dirname, '../..', 'w-models/src/wealth-construction'), { recursive: true, force: true });
	return Promise.all(swaggerDefs.map(function ({ name }) {
		return move(
			resolve(__dirname, getOutFolder(name), 'model'),
			resolve(__dirname, '../..', 'w-models/src/wealth-construction'),
		);
	}));
}).then(function () {
	// return ('@axioma/utils/workspaces/clean')(join(__dirname, 'outdir'));
	fs.rmSync(join(__dirname, 'outdir'), { recursive: true, force: true });
}).then(function () {
	fs.rmSync(join(__dirname, '../..', 'w-models/src/wealth-construction/jsonNode.ts'), { force: true });
	const indexFilePath = join(__dirname, '../..', 'w-models/src/wealth-construction/index.ts');
	var data = fs.readFileSync(indexFilePath, 'utf-8').split('\n').filter((val) => val.indexOf(`export * from './jsonNode';`) < 0).join('\n');
	fs.writeFileSync(indexFilePath, data, 'utf-8');

	let versionUpdated = false;
	fs.readdirSync(join(__dirname, '../..', 'w-models/src/wealth-construction/'), { withFileTypes: true })
		.filter(item => !item.isDirectory() && item.name !== 'index.ts')
		.forEach(item => {
			const content = fs.readFileSync(join(__dirname, '../..', 'w-models/src/wealth-construction/', item.name), 'utf-8');
			const newValue = content.replace(/OpenAPI spec version\: (.*)/gmi, 'OpenAPI spec version: @@version.txt');
			fs.writeFileSync(join(__dirname, '../..', 'w-models/src/wealth-construction/', item.name), newValue, 'utf-8');
			if (!versionUpdated) {
				fs.writeFileSync(join(__dirname, '../..', 'w-models/src/wealth-construction/version.txt'), content.match(/OpenAPI spec version\: (.*)/gmi)[0], 'utf-8');
				versionUpdated = true;
			}
		});
});

// function readWriteSync() {
// 	var data = fs.readFileSync(filepath, 'utf-8');

// 	// replace 'world' together with the new line character with empty
// 	var newValue = data.replace(/world\n/, '');

// 	fs.writeFileSync(filepath, newValue, 'utf-8');
// }

function getOutFolder(name) {
	return `outdir/${name}`;
}

/**
 * @param {string} from
 * @param {string} to
 */
async function move(from, to) {
	const [fromStat, toStat] = await Promise.all([safeStat(from), safeStat(to)]);
	if (!fromStat) {
		throw new Error(`"${from}" does not exist`);
	}

	if (fromStat.isDirectory()) {
		await ensureDir(to, toStat);
		for (const child of await readdir(from)) {
			await move(join(from, child), join(to, child));
		}
	} else {
		if (to.endsWith('models.ts')) {
			to = to.replace('models.ts', 'index.ts');
		}
		await rename(from, to);
	}
}

function safeStat(path) {
	return stat(path).catch(noop);
}

function noop() { }

/**
 * @param {string} source
 * @param {import('fs').Stats| void} sourceStat
 */
function ensureDir(source, sourceStat) {
	if (!sourceStat) {
		return mkdir(source);
	}

	if (sourceStat.isFile()) {
		return Promise.reject(new Error(`"${source}" is a file, but should be a folder`));
	}


}
