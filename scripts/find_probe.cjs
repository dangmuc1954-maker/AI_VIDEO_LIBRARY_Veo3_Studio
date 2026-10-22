const fs = require('fs');
const curCode = fs.readFileSync('app/out/main/index.js', 'utf8');

let idx = 0;
while ((idx = curCode.indexOf('-hide_banner', idx)) !== -1) {
  console.log('Match at', idx, curCode.slice(Math.max(0, idx - 100), idx + 150));
  idx += 12;
}
