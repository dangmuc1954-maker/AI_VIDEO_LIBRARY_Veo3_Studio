const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

let idx = 0;
while ((idx = content.indexOf('detectPageState', idx)) !== -1) {
  console.log('detectPageState at ' + idx);
  console.log(content.slice(idx, idx + 200));
  idx += 15;
}
