const fs = require('fs');
const path = require('path');
const file = path.resolve('app/out/main/index.js');
const code = fs.readFileSync(file, 'utf8');

const pos = code.indexOf('installGoogleFlowNetworkSniffer(');
console.log('--- Context of installGoogleFlowNetworkSniffer: ---');
console.log(code.slice(pos - 400, pos + 400));
