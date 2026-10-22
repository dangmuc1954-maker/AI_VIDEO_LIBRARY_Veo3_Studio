const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

let idx = 500000;
while ((idx = content.indexOf('ja(', idx)) !== -1 && idx < 580000) {
  console.log('ja( at ' + idx + ': ' + content.slice(Math.max(0, idx - 30), Math.min(content.length, idx + 100)));
  idx += 3;
}
