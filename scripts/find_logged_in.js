const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

let idx = 0;
while ((idx = content.indexOf('"Logged In"', idx)) !== -1) {
  console.log('--- "Logged In" at ' + idx + ' ---');
  console.log(content.slice(Math.max(0, idx - 150), Math.min(content.length, idx + 250)));
  idx += 11;
}
