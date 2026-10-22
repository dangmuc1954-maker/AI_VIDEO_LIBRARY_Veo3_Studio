const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

let idx = 0;
while ((idx = content.indexOf('"veo3"', idx)) !== -1) {
  const snippet = content.slice(Math.max(0, idx - 50), Math.min(content.length, idx + 200));
  if (snippet.includes('startUrl')) {
    console.log('startUrl at ' + idx + ':');
    console.log(snippet);
  }
  idx += 6;
}
