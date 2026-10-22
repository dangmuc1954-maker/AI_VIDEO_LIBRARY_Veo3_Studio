const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/index-BS7vgKVV.js', 'utf8');

let idx = 0;
while ((idx = content.indexOf('AI VIDEO LIBRARY', idx)) !== -1) {
  console.log('--- Found at', idx, '---');
  console.log(content.slice(Math.max(0, idx - 100), Math.min(content.length, idx + 400)));
  idx += 'AI VIDEO LIBRARY'.length;
}
