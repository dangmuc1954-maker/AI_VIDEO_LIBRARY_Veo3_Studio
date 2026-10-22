const fs = require('fs');
const runner = fs.readFileSync('app/out/renderer/assets/useWorkflowRunner-BmcV20yZ.js', 'utf8');
const p = runner.indexOf('Provider result collected.');
const asyncIdx = runner.lastIndexOf('async', p - 2000);
console.log('Async at:', asyncIdx);
console.log(runner.slice(asyncIdx, asyncIdx + 400));
