const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

const idx = content.indexOf('cacheGeneratedVideoBytes(');
console.log('cacheGeneratedVideoBytes idx:', idx);
if (idx !== -1) {
  console.log(content.slice(idx - 100, idx + 400));
}
