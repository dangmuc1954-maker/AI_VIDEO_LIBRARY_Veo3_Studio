const fs = require('fs');

const preload = fs.readFileSync('app/out/preload/index.cjs', 'utf8');
const p = preload.indexOf('cancelMerge');
console.log('cancelMerge in preload at', p);
if (p !== -1) {
  console.log(preload.slice(p - 150, p + 250));
}
