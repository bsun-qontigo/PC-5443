// @ts-check
// TODO upload css into CDN and get back corresponding url, and insert this url into html file;
const { readFileSync } = require('fs');
const { join } = require('path');
const https = require("https");

const cssBlobUrl = 'https://us5wostg.blob.core.windows.net/customb2c/customize.css';
const cssBlobSasUrl = 'https://us5wostg.blob.core.windows.net/customb2c/customize.css?sp=rw&st=2023-07-25T14:31:40Z&se=2024-09-01T22:31:40Z&spr=https&sv=2022-11-02&sr=b&sig=%2BMztvJSivLTnLurRUNGgZozfS6qaX9O61X1qXwu%2FppQ%3D';
let cssFileContent = readFileSync(join(__dirname, 'customize.css'), 'utf8');
publish(cssBlobSasUrl, cssFileContent, 'text/css;charset=UTF-8');

const htmlBlobSasUrl = `https://us5wostg.blob.core.windows.net/customb2c/customize-ui.html?sp=rw&st=2023-07-25T14:29:04Z&se=2024-09-01T22:29:04Z&spr=https&sv=2022-11-02&sr=b&sig=8LNAtStyVSK6KTsqFnzdSAif%2B9MAZyyz1SukRXtXff0%3D`;
let htmlFileContent = readFileSync(join(__dirname, 'customize-ui.html'), 'utf8');
htmlFileContent = htmlFileContent.replace('__cssBlobUrl__', cssBlobUrl);
publish(htmlBlobSasUrl, htmlFileContent, 'text/plain;charset=UTF-8');

function publish(blobSasUrl, fileContent, contentType) {
    return new Promise((resolve, reject) => {
        const options = {
            port: 443,
            method: 'PUT',
            headers: {
                'Content-Type': contentType,
                'Content-Length': fileContent.length,
                'X-Ms-Blob-Type': 'BlockBlob'
            }
        };
        const req = https.request(blobSasUrl, options, (res) => {
            if (res.statusCode != 201) {
                return reject(new Error(`HTTP status code ${res.statusCode}`));
            }
            const body = [];
            res.on('data', (chunk) => body.push(chunk));
            res.on('end', () => {
                resolve(Buffer.concat(body).toString());
            });
        });
        req.on('error', (e) => {
            reject(e.message);
        });
        req.write(fileContent);
        req.end();
    });
}
