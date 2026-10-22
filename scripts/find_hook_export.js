const fs = require('fs');
const runner = fs.readFileSync('app/out/renderer/assets/useWorkflowRunner-BmcV20yZ.js', 'utf8');
const hookIdx = runner.indexOf('function useWorkflowRunner') !== -1 ? runner.indexOf('function useWorkflowRunner') : runner.indexOf('useWorkflowRunner=');
console.log('Hook at:', hookIdx);
if (hookIdx !== -1) {
  console.log(runner.slice(hookIdx, hookIdx + 400));
} else {
  // Let's find export of runner
  console.log('Last 500 chars:', runner.slice(-500));
}
