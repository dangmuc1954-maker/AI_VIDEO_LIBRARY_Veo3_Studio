const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

const idx = content.indexOf('new Qp(');
console.log('new Qp idx:', idx);
if (idx !== -1) {
  console.log(content.slice(idx, idx + 1000));
}
// or let's search where the class constructor at 271350 is instantiated
const idx2 = content.indexOf('this.resolveClaimJob=d');
console.log('constructor around 271350:');
console.log(content.slice(idx2 - 300, idx2 + 100));
