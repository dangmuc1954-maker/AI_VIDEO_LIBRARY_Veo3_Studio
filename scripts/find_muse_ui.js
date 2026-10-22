const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/VideoStudio-frcr8V6s.js', 'utf8');

let idx = 0;
while (true) {
  idx = content.indexOf('Muse AI', idx);
  if (idx === -1) break;
  console.log('--- FOUND at', idx, '---');
  console.log(content.slice(Math.max(0, idx - 80), Math.min(content.length, idx + 150)));
  idx += 7;
}
