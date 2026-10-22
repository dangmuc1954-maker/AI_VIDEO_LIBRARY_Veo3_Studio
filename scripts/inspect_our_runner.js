const fs = require('fs');
const runner = fs.readFileSync('app/out/renderer/assets/useWorkflowRunner-DGw6Ekx4.js', 'utf8');

const p = runner.indexOf('else if(r.type==="prompt"||r.type==="text"){');
console.log('p in our runner:', p);
if (p !== -1) {
  console.log('Before target:\n', runner.slice(p - 300, p));
}

// Also check helper functions like yo, Qe, Ca, etc.
const helpers = ['yo(', 'Qe', 'Ca('];
helpers.forEach(h => {
  console.log('Helper', h, 'in our runner:', runner.includes(h));
});
