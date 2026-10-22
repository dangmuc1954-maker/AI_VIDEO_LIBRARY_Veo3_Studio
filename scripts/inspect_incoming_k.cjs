const fs = require('fs');
const path = require('path');

const curPath = path.resolve(__dirname, '../app/out/renderer/assets/useWorkflowRunner-DGw6Ekx4.js');
const curCode = fs.readFileSync(curPath, 'utf8');

// Check how incoming data `k` is passed to node runner
const runNodeIdx = curCode.indexOf('r.type==="video-script-extract"');
console.log(curCode.slice(runNodeIdx - 300, runNodeIdx + 400));
