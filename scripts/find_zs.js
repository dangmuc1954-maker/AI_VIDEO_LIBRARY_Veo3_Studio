const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/VideoStudio-frcr8V6s.js', 'utf8');

const idx = content.indexOf('as zs');
console.log('as zs at', idx);
if (idx !== -1) {
  console.log(content.slice(idx - 50, idx + 100));
}
