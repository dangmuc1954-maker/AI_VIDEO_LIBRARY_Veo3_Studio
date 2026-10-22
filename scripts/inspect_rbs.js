const fs = require('fs');
const content = fs.readFileSync('temp_original_main.js', 'utf8');

let idx = 0;
while ((idx = content.indexOf('refreshBrowserSession', idx)) !== -1) {
  console.log('--- refreshBrowserSession at ' + idx + ' ---');
  console.log(content.slice(Math.max(0, idx - 50), Math.min(content.length, idx + 400)));
  idx += 22;
}
