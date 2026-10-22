const fs = require('fs');
const curMain = fs.readFileSync('app/out/main/index.js', 'utf8');

const idx = curMain.indexOf('executeFlowVideoRpc');
console.log('executeFlowVideoRpc at', idx);
if (idx !== -1) {
  console.log(curMain.slice(idx - 100, idx + 1000));
}
