const fs = require('fs');

const index = fs.readFileSync('app/out/renderer/assets/index-BS7vgKVV.js', 'utf8');

let p = index.indexOf('case"text-splitter":');
console.log('case"text-splitter": at', p);
if (p !== -1) {
  console.log(index.slice(p - 100, p + 500));
}
