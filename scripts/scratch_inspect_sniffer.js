const fs = require('fs');
const path = require('path');
const file = path.resolve('app/out/main/index.js');
const code = fs.readFileSync(file, 'utf8');

const pos = code.indexOf('installGoogleFlowNetworkSniffer');
console.log(code.slice(pos - 50, pos + 900));
