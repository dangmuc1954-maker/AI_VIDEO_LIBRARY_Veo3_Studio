const fs = require('fs');
const runner = fs.readFileSync('app/out/renderer/assets/useWorkflowRunner-BmcV20yZ.js', 'utf8');
const p = 124485;
const funcIdx = runner.lastIndexOf('function', p);
console.log('Function before 124485 at:', funcIdx);
console.log(runner.slice(funcIdx, funcIdx + 500));
