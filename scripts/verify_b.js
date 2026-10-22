const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

const idx = content.indexOf('function _B(r,e){return ud(r)?jB(r,e):ea(r)?xB(r,e):{accountId:r.accountId,account:r.account}}');
console.log('Found _B:', idx !== -1);
if (idx !== -1) {
  console.log(content.slice(idx, idx + 200));
}
