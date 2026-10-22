const fs = require('fs');
const curCode = fs.readFileSync('app/out/renderer/assets/useWorkflowRunner-DGw6Ekx4.js', 'utf8');

let idx = 0;
while ((idx = curCode.indexOf('r.type==="google-flow"', idx)) !== -1) {
  console.log('--- At', idx, '---');
  console.log(curCode.slice(idx, idx + 800));
  idx += 20;
}
