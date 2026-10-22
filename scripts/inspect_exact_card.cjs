const fs = require('fs');
const path = require('path');

const curPath = path.resolve(__dirname, '../app/out/renderer/assets/WorkflowEditor-LHGC9K3C.js');
const curCode = fs.readFileSync(curPath, 'utf8');

console.log(curCode.slice(414047, 417500));
