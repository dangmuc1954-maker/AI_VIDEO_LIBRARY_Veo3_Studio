const fs = require('fs');

const index = fs.readFileSync('app/out/renderer/assets/index-BS7vgKVV.js', 'utf8');

let p = index.indexOf('outputs:[{id:`${');
console.log('outputs:[{id:`${ at', p);
if (p !== -1) {
  console.log(index.slice(p - 200, p + 500));
}
