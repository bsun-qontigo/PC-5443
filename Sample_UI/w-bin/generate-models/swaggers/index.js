/** @type {{name:string, args:  (() => (string[]|Promise<string[]>))}[]} */
module.exports = [
	{ name: 'wealth', args: require('./wealth') }
];
