const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

function searchSnippet(pattern) {
  let pos = 0;
  let count = 0;
  while ((pos = content.indexOf(pattern, pos)) !== -1 && count < 5) {
    console.log(`=== Pattern "${pattern}" at ${pos} ===`);
    console.log(content.slice(Math.max(0, pos - 100), pos + 800));
    pos += pattern.length;
    count++;
  }
}

searchSnippet('fetchInGrokAutomationPage');
searchSnippet('class vw'); // or grok runtime class
