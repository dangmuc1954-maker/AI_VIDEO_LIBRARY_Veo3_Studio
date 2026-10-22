const fs = require('fs');

const main = fs.readFileSync('app/out/main/index.js', 'utf8');
const p = main.indexOf('this.writeAsset(');
console.log('this.writeAsset call:');
if (p !== -1) {
  console.log(main.slice(p - 50, p + 350));
}
