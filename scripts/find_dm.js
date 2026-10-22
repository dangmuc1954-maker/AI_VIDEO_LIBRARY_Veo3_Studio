const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

const idx = content.indexOf('class dm');
console.log('Class dm idx:', idx);
if (idx !== -1) {
  console.log(content.slice(idx, idx + 800));
}
