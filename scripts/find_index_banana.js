const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/index-BS7vgKVV.js', 'utf8');
let idx = 0;
while ((idx = content.indexOf('providerId', idx)) !== -1) {
  const start = Math.max(0, idx - 50);
  const end = Math.min(content.length, idx + 200);
  const snippet = content.substring(start, end);
  if (snippet.includes('banana') || snippet.includes('Banana')) {
    console.log('--- At ' + idx + ' ---');
    console.log(snippet);
  }
  idx += 11;
}
