const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/index-BS7vgKVV.js', 'utf8');

const idx = content.indexOf('Hàng đợi Video');
console.log('Hàng đợi Video at', idx);
if (idx !== -1) {
  console.log(content.slice(idx - 100, idx + 150));
}
