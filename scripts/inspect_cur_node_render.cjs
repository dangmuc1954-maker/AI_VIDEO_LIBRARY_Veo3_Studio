const fs = require('fs');
const path = require('path');

const curPath = path.resolve(__dirname, '../app/out/renderer/assets/WorkflowEditor-LHGC9K3C.js');
const curCode = fs.readFileSync(curPath, 'utf8');

const idx = curCode.indexOf('video-script-extract');
console.log(curCode.slice(idx + 100, idx + 2500));
