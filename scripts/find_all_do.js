const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/VideoStudio-frcr8V6s.js', 'utf8');

const regex = /\bDo\b/g;
let m;
let count = 0;
while ((m = regex.exec(content)) !== null && count < 20) {
  console.log('Do at', m.index);
  console.log(content.slice(Math.max(0, m.index - 50), m.index + 100));
  count++;
}
