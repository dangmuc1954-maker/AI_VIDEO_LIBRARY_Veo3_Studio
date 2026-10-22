const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

// Find all occurrences of readSessionToken
let idx = 0;
while ((idx = content.indexOf('readSessionToken', idx)) !== -1) {
  console.log('--- readSessionToken at ' + idx + ' ---');
  console.log(content.slice(Math.max(0, idx - 50), Math.min(content.length, idx + 400)));
  idx += 16;
}
