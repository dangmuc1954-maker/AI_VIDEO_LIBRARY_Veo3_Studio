const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/index-BS7vgKVV.js', 'utf8');

const matches = [...content.matchAll(/updatePrompt\s*:\s*\(/g)];
console.log('updatePrompt matches:', matches.length);
for (const m of matches) {
  console.log(content.slice(m.index, m.index + 300));
}
