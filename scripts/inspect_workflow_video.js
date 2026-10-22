const fs = require('fs');
const code = fs.readFileSync('app/out/renderer/assets/useWorkflowRunner-BmcV20yZ.js', 'utf8');

const matches = [];
let idx = 0;
while ((idx = code.indexOf('type:"Video"', idx)) !== -1) {
  matches.push({
    pos: idx,
    context: code.slice(Math.max(0, idx - 60), Math.min(code.length, idx + 350))
  });
  idx += 12;
}

console.log('Found', matches.length, 'type:Video in useWorkflowRunner:');
matches.forEach((m, i) => {
  console.log(`\n--- Match #${i + 1} at ${m.pos} ---`);
  console.log(m.context);
});
