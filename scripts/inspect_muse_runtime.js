const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

const idx = content.indexOf('class MuseVideoRuntime');
console.log('MuseVideoRuntime idx:', idx);
if (idx !== -1) {
  console.log(content.slice(idx, idx + 2500));
}
