const fs = require('fs');
const path = require('path');

const curPath = path.resolve(__dirname, '../app/out/renderer/assets/useWorkflowRunner-DGw6Ekx4.js');
const curCode = fs.readFileSync(curPath, 'utf8');

const sIdx = curCode.indexOf('video-script-extract');
console.log(curCode.slice(sIdx - 100, sIdx + 1200));
