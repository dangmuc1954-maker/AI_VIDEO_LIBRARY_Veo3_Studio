const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

let idx = 0;
while ((idx = content.indexOf('"browser:', idx)) !== -1) {
  console.log(content.slice(idx, idx + 60));
  idx += 10;
}
