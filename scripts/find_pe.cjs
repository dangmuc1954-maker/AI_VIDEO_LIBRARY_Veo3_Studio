const fs = require('fs');

const vs = fs.readFileSync('app/out/renderer/assets/VideoStudio-BZY_1pM8.js', 'utf8');

const matches = [];
let pos = 0;
while ((pos = vs.indexOf('pe=', pos)) !== -1) {
  matches.push(vs.slice(Math.max(0, pos - 50), Math.min(vs.length, pos + 150)));
  pos += 4;
}
console.log('pe matches:', matches);
