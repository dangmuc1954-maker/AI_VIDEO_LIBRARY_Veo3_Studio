const fs = require('fs');
const runner = fs.readFileSync('app/out/renderer/assets/useWorkflowRunner-BmcV20yZ.js', 'utf8');
const p = 124485;
console.log(runner.slice(p - 600, p));
