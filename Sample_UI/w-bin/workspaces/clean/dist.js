const clean = require('.');
const { rm } = require('fs');
const originals = require('../workspaces').originals;
const join = require('path').join;
module.exports = doClean;
if (!module.parent) {
    doClean();
}


function doClean() {
    const promises = [];
    originals.filter(i => !i.includes('middleware')).forEach(path => {
        promises.push(clean(join(path, 'dist')));
        promises.push(clean(join(path, '/node_modules/.cache')));
    });
    promises.push(clean(join('w-bComponents', 'dist')));

    promises.push(clean(join('node_modules/.jest', 'dist')));
    rm('./wealth-app-deployment.yaml', ()=>{});
    rm('./wealth.list', ()=>{});
    rm('./wealth.json', ()=>{});
    return Promise.all(promises);
}