const fs = require('fs');
const content = fs.readFileSync('temp_original_main.js', 'utf8');

let idx = 0;
while ((idx = content.indexOf('resolveRefreshUrl', idx)) !== -1) {
  console.log('at ' + idx + ': ' + content.slice(idx - 20, idx + 100));
  idx += 18;
}
