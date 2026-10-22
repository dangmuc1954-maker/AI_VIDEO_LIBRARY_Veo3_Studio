const fs = require('fs');
const path = require('path');

const curPath = path.resolve(__dirname, '../app/out/renderer/assets/WorkflowEditor-LHGC9K3C.js');
const curCode = fs.readFileSync(curPath, 'utf8');

// Find onRunNode in curCode
let idx = 0;
while ((idx = curCode.indexOf('onRunNode', idx)) !== -1) {
  console.log('--- onRunNode at', idx, '---');
  console.log(curCode.slice(Math.max(0, idx - 100), idx + 200));
  idx += 10;
}
