const fs = require('fs');

const index = fs.readFileSync('app/out/renderer/assets/index-BS7vgKVV.js', 'utf8');

let p = index.indexOf('video:new Set(["google-flow","grok"');
console.log('video:new Set in index at', p);
if (p !== -1) {
  console.log(index.slice(p - 100, p + 500));
}
