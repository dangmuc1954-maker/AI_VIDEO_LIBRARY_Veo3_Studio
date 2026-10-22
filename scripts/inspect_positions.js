const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/VideoStudio-frcr8V6s.js', 'utf8');

const positions = [22484, 42026, 56708, 62041, 89885];
for (const p of positions) {
  console.log(`\n--- POSITION ${p} ---`);
  console.log(content.slice(Math.max(0, p - 300), Math.min(content.length, p + 300)));
}
