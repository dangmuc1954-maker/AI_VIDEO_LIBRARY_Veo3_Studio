const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

function findSnippet(query) {
  let pos = 0;
  let count = 0;
  while ((pos = content.indexOf(query, pos)) !== -1 && count < 10) {
    console.log('--- FOUND at', pos, '---');
    console.log(content.slice(Math.max(0, pos - 50), pos + 250));
    pos += query.length;
    count++;
  }
}

console.log('=== SEARCHING GrokVideoRuntime ===');
findSnippet('GrokVideoRuntime');

console.log('=== SEARCHING MuseVideoRuntime ===');
findSnippet('MuseVideoRuntime');
