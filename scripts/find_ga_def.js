const fs = require('fs');
const runner = fs.readFileSync('app/out/renderer/assets/useWorkflowRunner-BmcV20yZ.js', 'utf8');
console.log(runner.slice(124300, 124600));
