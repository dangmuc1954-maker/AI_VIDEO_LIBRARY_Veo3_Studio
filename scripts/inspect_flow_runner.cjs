const fs = require('fs');
const path = require('path');

const curPath = path.resolve(__dirname, '../app/out/renderer/assets/useWorkflowRunner-DGw6Ekx4.js');
const curCode = fs.readFileSync(curPath, 'utf8');

// Find google-flow in useWorkflowRunner
const idx = curCode.indexOf('type==="google-flow"');
console.log('google-flow index:', idx);
if (idx !== -1) {
  console.log(curCode.slice(idx, idx + 1500));
}
