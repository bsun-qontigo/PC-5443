const { readdir: fsReaddir, unlink: fsUnlink, lstat: fsStat, rmdir: fsRmdir } = require('fs');
const { promisify } = require('util');
const { join, normalize } = require('path');
const readdir = memoize(fsReaddir);
const stat = memoize(fsStat);
const unlink = memoize(fsUnlink);
const rmdir = memoize(fsRmdir);

const clean = memoize(realclean, true);
module.exports = clean;

function realclean(dirName) {
    return stat(dirName)
        .catch(noop)
        .then(stats => {
            if (!stats) {
                return;
            }
            if (stats.isSymbolicLink() || stats.isFile()) {
                return unlink(dirName);
            } else {
                return readdir(dirName)
                    .then(files => Promise.all(files.map(callClean, dirName)))
                    .then(() => rmdir(dirName));
            }
        })
        .catch(failed);
}


function memoize(fn, prom) {
    const cache = {};
    fn = prom ? fn : promisify(fn);
    const result = function(name) {
        name = normalize(name);
        if (cache[name]) {
            return cache[name];
        }

        return cache[name] = fn(name);
    };
	result.original = fn;
	return result
}

// this is provided as a second argument in files.map line 18
function callClean(file) {
    return clean(join(this.toString(), file));
}

function noop() {}

function failed(err) {
    require('../../colors');
    console.error(toRed(`Something went wrong when trying to unlink ${getPathFrom(err)}`));
    console.warn('If you have VsCode open, or some process running, close them and try again');
    console.error('The error thrown was:\r\n', err);
    process.exit(1);
}

function toRed(text) {
    return text.red || text;
}

function getPathFrom(err) {
    if (err.path) {
        return `"${err.path.prettyPath || err.path}"`;
    }

    return "some of the folders";
}

if (!module.parent) {
    setImmediate(function() {
        require('./deps');
        require('./dist');
    });
}