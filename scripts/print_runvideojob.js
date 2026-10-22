const fs = require('fs');
const curMain = fs.readFileSync('app/out/main/index.js', 'utf8');

const idx = curMain.indexOf('async runVideoJobViaRpc');
console.log('runVideoJobViaRpc at', idx);
if (idx !== -1) {
  console.log(curMain.slice(idx, idx + 4000));
}
