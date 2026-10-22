const fs = require('fs');
const runner = fs.readFileSync('app/out/renderer/assets/useWorkflowRunner-BmcV20yZ.js', 'utf8');
const matches = [...runner.matchAll(/,p\s*=/g)];
matches.forEach(m => {
  if (m.index < 124485 && m.index > 100000) {
    console.log('Match at', m.index, runner.slice(m.index, m.index + 200));
  }
});
