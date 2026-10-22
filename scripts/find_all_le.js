const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

let idx = 0;
while ((idx = content.indexOf('Le=', idx)) !== -1) {
  console.log('Le= at ' + idx + ': ' + content.slice(idx - 20, idx + 50));
  idx += 3;
}
