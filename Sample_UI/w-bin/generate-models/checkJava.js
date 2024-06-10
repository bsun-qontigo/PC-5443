// @ts-check
module.exports = function() {
    const http = require('https'); // or 'https' for https:// URLs
    const fs = require('fs');
    const { join } = require('path');
    const jarPath = join(__dirname, 'swagger-codegen-cli-3.0.40.jar')
    if (fs.existsSync(jarPath)) {
        return;
    }
	return download('https://repo1.maven.org/maven2/io/swagger/codegen/v3/swagger-codegen-cli/3.0.40/swagger-codegen-cli-3.0.40.jar', jarPath)
	.then(() => new Promise(function(resolve, reject) {
        const child = require('child_process').spawn('java', ['-version'], { shell: true });
        let chunks = [];
        child
            .on('exit', function() {
                const data = chunks.join('').split('\n')[0];
                const javaVersion = new RegExp('java version').test(data) ? data.split(' ')[2].replace(/"/g, '') : false;
                if (javaVersion != false) {
                    resolve(void 0);
                } else {
                    reject(new Error('java not found'));
                }
            })
            .on('error', function() {
                reject(new Error('java not found'));
            }).stderr.on('data', function(data) {
                chunks.push(data.toString());
            });
    }))

    function download(from, to) {
        const file = fs.createWriteStream(to);
        return new Promise((resolve, reject) => {
            http.get(from, function(response) {
                response.pipe(file)
                    .on('error', reject)
                    .on('close', resolve);
            }).on('error', reject);
        })
    }
}