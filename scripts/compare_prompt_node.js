const fs = require('fs');

const zip3Runner = fs.readFileSync('scratch/zip3_source_app/resources/app/out/renderer/assets/useWorkflowRunner-BmcV20yZ.js', 'utf8');
const ourRunner = fs.readFileSync('app/out/renderer/assets/useWorkflowRunner-DGw6Ekx4.js', 'utf8');

// Find where prompt node begins in both
const zPrompt = zip3Runner.indexOf('else if(r.type==="prompt"||r.type==="text"){');
const oPrompt = ourRunner.indexOf('else if(r.type==="prompt"||r.type==="text"){');

console.log('=== ZIP3 PROMPT NODE ===');
console.log(zip3Runner.slice(zPrompt, zPrompt + 400));

console.log('\n=== OUR PROMPT NODE ===');
console.log(ourRunner.slice(oPrompt, oPrompt + 400));
