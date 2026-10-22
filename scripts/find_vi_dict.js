const fs = require('fs');
const c = fs.readFileSync('extracted_aiforge_studio/out/renderer/assets/index-DqhuWq2K.js', 'utf8');

const viIdx = c.indexOf('Biên tập Video');
console.log('viIdx:', viIdx);
if (viIdx !== -1) {
  console.log(c.slice(Math.max(0, viIdx - 200), viIdx + 3000));
}
