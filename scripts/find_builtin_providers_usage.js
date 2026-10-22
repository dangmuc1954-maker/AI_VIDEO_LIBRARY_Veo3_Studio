const fs = require('fs');

const content = fs.readFileSync('app/out/renderer/assets/BrowserHub-44JPDUjK.js', 'utf8');

// Find all functions that return or process providers
// Let's search where _e (the builtin providers) is used!
let idx = 0;
while ((idx = content.indexOf('_e', idx)) !== -1) {
  console.log('=== _e at', idx, '===');
  console.log(content.slice(Math.max(0, idx - 100), Math.min(content.length, idx + 200)));
  idx += 2;
}
