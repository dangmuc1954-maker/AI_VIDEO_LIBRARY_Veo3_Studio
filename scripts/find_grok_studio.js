const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/VideoStudio-frcr8V6s.js', 'utf8');

let pos = 0;
let count = 0;
while ((pos = content.indexOf('"Grok"', pos)) !== -1 && count < 25) {
  console.log(`--- "Grok" at ${pos} ---`);
  console.log(content.slice(Math.max(0, pos - 80), pos + 180));
  pos += 6;
  count++;
}
