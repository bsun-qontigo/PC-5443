// @ts-check
// require('@axioma/utils/colors');
const { relative, resolve, normalize } = require('path');
/**
 * @typedef {{
 * 	ruleId: string;
 * 	severity: number;
 * 	message: string;
 * 	line: number;
 * 	column: number;
 * 	nodeType: string;
 * 	endLine: number;
 * 	endColumn: number;
 * 	}} Message
 * @typedef {{
 * 	filePath:string;
 * 	errorCount: number;
 * 	warningCount: number;
 * 	fixableErrorCount: number;
 * 	fixableWarningCount: number;
 * 	source: string;
 * 	messages: Message[]
 * }} Result
 */
module.exports = printer;
debugger;
/**
 *
 * @param {Result[]} results
 */
function printer(results) {
    results.forEach(printResult);
}
/**
 * @param {Result} result
 */
function printResult(result) {
    result.messages.forEach(m => {
        if (m.ruleId && !m.ruleId.startsWith('@type')) {
            debugger;
        }
        console.log(`${getFileNameAndLineNumber(result, m)}=> [${m.ruleId}] ${m.message}`);
    });
}
/**
 *
 * @param {Result} result
 * @param {Message} message
 */
function getFileNameAndLineNumber(result, message) {
    const dir = normalize(resolve(__dirname, '../../'));
    const path = '.' + normalize(result.filePath).slice(dir.length).replace(/\\/g, '/');
    return `${path}:${message.line}:${message.column}`;
}