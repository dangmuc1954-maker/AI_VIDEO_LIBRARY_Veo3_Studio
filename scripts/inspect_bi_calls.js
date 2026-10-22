const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/VideoStudio-frcr8V6s.js', 'utf8');

const matches = [...content.matchAll(/Bi\s*\(/g)];
console.log('Bi calls count:', matches.length);
for (const m of matches) {
  console.log('Bi call at', m.index);
  console.log(content.slice(Math.max(0, m.index - 50), Math.min(content.length, m.index + 100)));
}
