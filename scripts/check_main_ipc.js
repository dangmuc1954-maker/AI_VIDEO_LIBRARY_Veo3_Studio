const fs = require('fs');

const main = fs.readFileSync('app/out/main/index.js', 'utf8');
const p = main.indexOf('assets:cancelMerge');
console.log('assets:cancelMerge in main at', p);
if (p !== -1) {
  console.log(main.slice(p - 300, p + 200));
}
