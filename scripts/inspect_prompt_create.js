const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/VideoStudio-frcr8V6s.js', 'utf8');

const end = 172588;
const sub = content.slice(end - 30000, end);
const matches = [...sub.matchAll(/\bme\s*=\s*/g)];
for (const m of matches) {
  console.log('--- me= at', m.index);
  console.log(sub.slice(m.index, m.index + 300));
}
