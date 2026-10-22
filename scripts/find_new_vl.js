const fs = require('fs');
const content = fs.readFileSync('temp_original_main.js', 'utf8');

let idx = 0;
while ((idx = content.indexOf('new vl(', idx)) !== -1) {
  console.log('new vl at ' + idx + ': ' + content.slice(Math.max(0, idx - 50), Math.min(content.length, idx + 200)));
  idx += 7;
}
