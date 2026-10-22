const fs = require('fs');
const c = fs.readFileSync('app/out/main/index.js', 'utf8');

let idx = 0;
while ((idx = c.indexOf('validateJob', idx)) !== -1) {
  console.log('validateJob at', idx, ':\n', c.slice(idx - 50, idx + 200));
  idx += 15;
}
