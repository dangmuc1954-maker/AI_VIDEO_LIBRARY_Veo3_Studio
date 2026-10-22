const fs = require('fs');
const zip3WfRunner = fs.readFileSync('scratch/zip3_source_app/resources/app/out/renderer/assets/useWorkflowRunner-BmcV20yZ.js', 'utf8');
const curWfRunner = fs.readFileSync('app/out/renderer/assets/useWorkflowRunner-DGw6Ekx4.js', 'utf8');

const idx1 = zip3WfRunner.indexOf('if(e.type==="google-flow"&&e.config?.mode==="Video")');
console.log('=== zip3 Video mode queue item: ===');
console.log(zip3WfRunner.slice(idx1, idx1 + 1000));

const idx2 = curWfRunner.indexOf('if(e.type==="google-flow"&&e.config?.mode==="Video")');
console.log('\n=== current Video mode queue item: ===');
console.log(curWfRunner.slice(idx2, idx2 + 1000));
