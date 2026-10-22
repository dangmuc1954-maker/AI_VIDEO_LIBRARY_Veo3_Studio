const fs = require('fs');

const ourRunner = fs.readFileSync('app/out/renderer/assets/useWorkflowRunner-DGw6Ekx4.js', 'utf8');

// Find where the loop or executeNode function begins
const oPrompt = ourRunner.indexOf('else if(r.type==="prompt"||r.type==="text"){');
console.log('Function context before prompt (800 chars):');
console.log(ourRunner.slice(oPrompt - 800, oPrompt));
