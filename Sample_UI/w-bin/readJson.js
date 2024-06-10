const { readFileSync } = require('fs');
/**
 * WARNING: do not use this for reading jsons on a live environment.
 * it will try to parse it with JSON.parse,and if it fails it will use eval (to support comments and trailing commas and things like that)
 *
 * This is intended, mostly so this code can work even if dependencies have not been installed at the time the command is running (for example some script that uses workspaceClasses.js)
 *
 * Reads a json (can have comments), returns undefined if it fails
 * @param {string} fileName
 */
module.exports = function (fileName) {
	const content = readFile(fileName);
	if (!content) {
		return undefined;
	}

	try {
		return JSON.parse(content);
	} catch{ }
	try {
		return Function(`return ${content}`)();
	} catch{ }

};

function readFile(file) {
	try {
		return readFileSync(file, 'utf8');
	} catch  {
		return;
	}
}
