// // @ts-check
// const { join, resolve } = require('path');
// const { writeFileSync } = require('fs');
// const root = resolve(__dirname, './../');
// const { spawnSync } = require('child_process');
// const spawn = require('child_process').spawn;
// const G_ACCOUNT_NAME = 'qcdntest123';
// const G_ACCESS_KEY = 'jJRrWrut8P/VQauZexTQFJzpu7OSZklm5carYSwISvcZdOcXEP3gG5m7ORZ9X6RirdYzxIc+UkcUTEdJzFKh1w==';
// const cdnUrl = `https://${G_ACCOUNT_NAME}.blob.core.windows.net`;
// // @ts-ignore
// const dedent = require('dedent-js');
// if (process.argv.includes('--deploy')) {
//     deployBranch();
// } else if (process.argv.includes('--clean-up')) {
//     cleanUp();
// } else if (process.argv.includes('--deploy-master-maybe')) {
//     if (process.env.G_BRANCH_NAME === 'master') {
//         uploadMasterToSecondaryStorage();
//     }
// } else {
//     console.warn('Invalid args, nothing done');
//     process.exit(0);
// }

// function cleanUp() {
//     return runGit(['rev-parse', '--abbrev-ref', 'HEAD'])
//         .then(branchName => {
//             console.log('Compiling azure upload code');
//             return compileAzure()
//                 .then(() => {
//                     branchName = branchName.trim();
//                     console.log('Cleaning up branch:', branchName);
//                     return cleanUpBranch(branchName);
//                 });
//         })
// }

// function deployBranch() {
//     console.log('IMPORTANT:' + ' Please don\'t do changes to the code while this process is running');
//     console.log();
//     console.log('Fetching');
//     const branchName = "feature/sswan/APP-1234";
//     return compileAzure()
//         .then(() => {
//             console.log('Uploading files');
//             return upload("feature/sswan/APP-1234");
//         })
//         .then(version => {
//             const obj = {
//                 version,
//                 cdnUrl,
//                 versionType: getVersionName(branchName),
//                 container: getUploadContainer(branchName)
//             }
//             const asText = stringify(obj);
//             const encoded = encode(asText);
//             console.log('Version uploaded:', `https://env.axioma.com/?v=${encodeURIComponent(encoded)}`);
//             console.log('Version token:', encoded);
//             let output = '';
//             for (const key in obj) {
//                 output += `${key}=${obj[key]}\n`;
//             }
//             output += `bootstrap=@axioma-apps/w-workspaces\n`;
//             output += 'type=master\n';
//             output += `authUrl=https://dev.axioma.com/auth\n`;
//             output += `apiClient=2396D91FA8084408861613079C9A3B01\n`;
//             output += `url=/rest\n`;
//             output += `wealthUrl=http://20.14.230.225/wealth-core\n`;
//             output += `aadB2cTenant=qontigoppssbox\n`;
//             output += `aadB2cClientSecret=3df8Q~Y9pzIGdwa22FUMYU3tZjzi-38UY6uarboO\n`;
//             output += `aadB2cClientId=380c6ea5-d2ce-4901-a7a8-5e8b4b2d1f72\n`;
//             output += `aadB2cRedirectUri=http://20.96.251.186:8181/\n`;
//             writeFileSync(join(root, '/wealth.list'), output);
//             const jsonObj = {
//                 ...obj,
//                 bootstrap: "@axioma-apps/w-workspaces",
//                 type: "master",
//                 authUrl: "https://dev.axioma.com/auth",
//                 apiClient: "2396D91FA8084408861613079C9A3B01",
//                 url: "/rest",
//                 wealthUrl: "http://20.14.230.225/wealth-core/",
//                 aadB2cTenant: "qontigoppssbox",
//                 aadB2cClientSecret: "",
//                 aadB2cClientId: "380c6ea5-d2ce-4901-a7a8-5e8b4b2d1f72",
//                 aadB2cRedirectUri: "http://20.96.251.186:8181/"
//             };
//             writeFileSync(join(root, '/wealth.json'), JSON.stringify(jsonObj, undefined, 4));
//             const yaml = generateYAML(jsonObj);
//             writeFileSync(join(root, '/wealth-app-deployment.yaml'), yaml);
//         }).catch(console.error);
// }

// function stringify(obj) {
//     const arr = randomize(Object.keys(obj));
//     return `{${arr.map(i => `"${i}": "${obj[i]}"`).join(',')}}`;
// }

// /**
//  * @param {string[]} arr
//  */
// function randomize(arr) {
//     const randomized = [];
//     arr = arr.slice();
//     while (arr.length) {
//         const randomIdx = arr.length === 1 ? 0 : ((Math.random() * 107) | 0) % arr.length;
//         randomized.push(arr.splice(randomIdx, 1)[0]);
//     }
//     return randomized;
// }
// /**
//  * @param {string} branch
//  */
// function getUploadContainer(branch) {
//     if (branch.toLowerCase().includes('hotfix/')) {
//         return 'hotfixes';
//     }

//     if (branch.toLowerCase().includes('relfix/')) {
//         return 'relfixes';
//     }

//     if (branch.toLowerCase().includes('feature/')) {
//         return 'features';
//     }

//     return 'unknown';
// }

// function getBranchToCompare(branch) {
//     if (branch.toLowerCase().includes('hotfix/')) {
//         return 'origin/prod';
//     } else if (branch.toLowerCase().includes('relfix/')) {
//         return getReleaseBranch();
//     } else {
//         return 'origin/master';
//     }
// }

// function getReleaseBranch() {
//     const spawnResult = spawnSync('git', ['branch', '-r', '-l', 'origin/release/*']);
//     const stdout = spawnResult.stdout.toString().trim();
//     const parts = stdout.split('\n').sort();
//     return parts[0];
// }

// /**
//  * @param {string} branch
//  */
// function getVersionName(branch) {
//     if (branch.toLowerCase().endsWith('master')) {
//         return 'master';
//     } else if (branch.toLowerCase().endsWith('prod')) {
//         return 'prod';
//     } else if (branch.toLowerCase().includes('release/')) {
//         return 'qa';
//     } else if (branch.toLowerCase().includes('hotfix/')) {
//         return 'hotfix';
//     } else if (branch.toLowerCase().includes('relfix/')) {
//         return 'relfix';
//     } else {
//         return 'feature';
//     }
// }

// /**
//  * @param {string} branch
//  */
// function getTicket(branch) {
//     let parts = /feature\/(?:([^/]*)\/)?([a-zA-Z]+-\d+)/.exec(branch);
//     if (parts) {
//         return parts[2];
//     }

//     parts = /(?:relfix|hotfix)\/(?:([^/]+)\/)?([a-zA-Z]+-\d+)/.exec(branch);
//     if (parts) {
//         const ticket = parts[2];
//         return `${ticket.toUpperCase()}`;
//     }

//     throw {
//         type: 'error',
//         message: `Cannot parse branch name "${branch}", expected "feature/username?/TICKET-NUMBER"`
//     };
// }

// /**
//  * @param {string} val
//  */
// function encode(val) {
//     const seed = randomSeed();
//     const arr = new Uint8Array(val.length + 1);
//     arr[0] = seed;
//     for (let i = 0; i < val.length; i++) {
//         let code = val.charCodeAt(i);
//         if (code !== mod(code)) {
//             throw new Error('Invalid char ' + val[i]);
//         }

//         arr[i + 1] = mod(code - i - seed);
//     }

//     return Buffer.from(arr).toString('base64');
// }

// function randomSeed() {
//     return ((Math.random() * 577) | 0) % 255
// }

// /**
//  * @param {string[]} args
//  */
// function runGit(args) {
//     return runProcess('git', args);
// }

// /**
//  * @param {number} numb
//  */
// function mod(numb) {
//     return ((numb % 255) + 255) % 255;
// }

// /**
//  * @param {string} proc
//  * @param {readonly string[]} args
//  */
// function runProcess(proc, args) {
//     return new Promise((resolve, reject) => {
//         const data = [];
//         const child = spawn(proc, args, {
//             shell: true,
//             stdio: 'pipe',
//         });
//         child.stderr.on('data', c => data.push(data));
//         child.stdout.on('data', c => data.push(c));
//         child.on('exit', code => {
//             if (code) {
//                 console.error(data.join(''));
//                 process.exit(code)
//             }
//         });
//         child.on('close', () => resolve(data.join('').trim()));
//         child.on('error', reject);
//     });
// }

// function compileAzure() {
//     return runProcess('yarn', ['azure', '-p']);
// }

// /**
//  * @param {string} branchName
//  */
// function upload(branchName) {
//     return new Promise((resolve, reject) => {
//         /**
//          * this should be roughly 1 year in seconds
//          * -3 is to remove the last 3 digits (seconds)
//          * a year in seconds is 31557600 (8 digits), which is why we take -11 (from the end take 8+3);
//          */
//         const seed = (Date.now()).toString().slice(-11, -3);
//         const version = `${getTicket(branchName)}+${seed}`
//         const child = spawn('yarn', ['storage-upload'], {
//             shell: true,
//             stdio: 'inherit',
//             env: Object.assign({}, process.env, {
//                 G_ACCOUNT_NAME,
//                 G_ACCESS_KEY,
//                 G_BRANCH_NAME: branchName,
//                 G_VERSION_NUMBER: version,
//                 G_IS_DEVELOP_FEATURE: 1
//             })
//         });
//         child.on('exit', code => code && process.exit(code));
//         child.on('close', resolve.bind(null, version));
//         child.on('error', reject);
//     });
// }

// function uploadMasterToSecondaryStorage() {
//     return new Promise((resolve) => {
//         const child = spawn('yarn', ['storage-upload'], {
//             shell: true,
//             stdio: 'inherit',
//             env: Object.assign({}, process.env, {
//                 G_ACCOUNT_NAME,
//                 G_ACCESS_KEY,
//             })
//         });
//         resolve = resolve.bind(null, process.env.G_VERSION_NUMBER);
//         child.on('exit', resolve);
//         child.on('close', resolve);
//         child.on('error', e => {
//             console.error(e);
//             // @ts-ignore
//             resolve();
//         });
//     });
// }

// function cleanUpBranch(branchName) {
//     return new Promise((resolve, reject) => {
//         /**
//          * this should be roughly 1 year in seconds
//          * -3 is to remove the last 3 digits (seconds)
//          * a year in seconds is 31557600 (8 digits), which is why we take -11 (from the end take 8+3);
//          */
//         const seed = (Date.now()).toString().slice(-11, -3);
//         const version = `${getTicket(branchName)}+${seed}`
//         const child = spawn('yarn', ['storage-upload', '--clean-branch', '-b'], {
//             shell: true,
//             stdio: 'inherit',
//             env: Object.assign({}, process.env, {
//                 G_ACCOUNT_NAME,
//                 G_ACCESS_KEY,
//                 G_BRANCH_NAME: branchName,
//                 G_VERSION_NUMBER: version,
//                 G_IS_DEVELOP_FEATURE: 1
//             })
//         });
//         child.on('exit', code => code && process.exit(code));
//         child.on('close', resolve.bind(null, version));
//         child.on('error', reject);
//     });
// }

// function generateYAML(config) {
//     const {
//         version,
//         cdnUrl,
//         versionType,
//         container,
//         bootstrap,
//         type,
//         authUrl,
//         apiClient,
//         url,
//         wealthUrl,
//         aadB2cTenant,
//         aadB2cClientSecret,
//         aadB2cClientId,
//         aadB2cRedirectUri
//     } = config;

//     return dedent(`apiVersion: v1
//   kind: Service
//   metadata:
//     creationTimestamp: null
//     labels:
//       app: wealth-ui-host
//     name: wealth-ui-host
//   spec:
//     ports:
//     - name:
//       port: 8181
//       protocol: TCP
//       targetPort: 8087
//     selector:
//       app: wealth-ui-host
//     type: LoadBalancer
//   ---
//   apiVersion: apps/v1
//   kind: Deployment
//   metadata:
//     name: wealth-ui-host-deployment
//   spec:
//     replicas: 1
//     selector:
//       matchLabels:
//         app: wealth-ui-host
//     template:
//       metadata:
//         labels:
//           app: wealth-ui-host
//       spec:
//         containers:
//         - name: wealth-ui-host
//           image: us5wealthoptregistry.azurecr.io/wealthiq-stable/wealth-ui-host:1.0
//           ports:
//           - containerPort: 8087
//           imagePullPolicy: Always
//           envFrom:
//             - configMapRef:
//                 name: wealth-app-config
//         imagePullSecrets:
//           - name: regcred
//   ---
//   apiVersion: v1
//   kind: ConfigMap
//   metadata:
//     name: wealth-app-config
//   data:
//     version: "${version}"
//     cdnUrl: "${cdnUrl}"
//     versionType: "${versionType}"
//     container: "${container}"
//     bootstrap: "${bootstrap}"
//     type: "${type}"
//     authUrl: "${authUrl}"
//     apiClient: "${apiClient}"
//     url: "${url}"
//     wealthUrl: "${wealthUrl}"
//     aadB2cTenant: "${aadB2cTenant}"
//     aadB2cClientSecret: "${aadB2cClientSecret}"
//     aadB2cClientId: "${aadB2cClientId}"
//     aadB2cRedirectUri: "${aadB2cRedirectUri}"
//     `);
// }