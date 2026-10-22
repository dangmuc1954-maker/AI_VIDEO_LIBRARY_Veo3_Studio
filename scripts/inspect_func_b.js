const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

const idx = content.indexOf('function _B(');
console.log('function _B idx:', idx);
if (idx !== -1) {
  console.log(content.slice(idx, idx + 1000));
}
