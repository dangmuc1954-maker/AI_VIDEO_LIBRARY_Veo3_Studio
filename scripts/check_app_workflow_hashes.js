const fs = require('fs');

const wf = fs.readFileSync('app/out/renderer/assets/Workflows-D6M9YgA1.js', 'utf8');
const m1 = wf.match(/WorkflowEditor-[^"]+/g);
console.log('In Workflows-D6M9YgA1.js WorkflowEditor:', m1);
