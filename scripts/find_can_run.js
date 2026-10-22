const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

let idx = 0;
while ((idx = content.indexOf('canRunJobSession', idx)) !== -1) {
  console.log('=== MATCH at ' + idx + ' ===');
  console.log(content.slice(Math.max(0, idx - 50), Math.min(content.length, idx + 300)));
  idx += 16;
}
