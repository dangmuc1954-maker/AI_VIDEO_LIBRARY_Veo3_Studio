const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/VideoStudio-frcr8V6s.js', 'utf8');

const end = 174351;
const sub = content.slice(end - 25000, end);
const matches = [...sub.matchAll(/\bto\s*=\s*/g)];
for (const m of matches) {
  console.log('to= at', m.index);
  console.log(sub.slice(m.index, m.index + 300));
}
