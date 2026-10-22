const fs = require('fs');

const content = fs.readFileSync('app/out/renderer/assets/BrowserHub-44JPDUjK.js', 'utf8');

let idx = 0;
while ((idx = content.indexOf('isCustom', idx)) !== -1) {
  console.log('=== MATCH isCustom at', idx, '===');
  console.log(content.slice(Math.max(0, idx - 200), Math.min(content.length, idx + 300)));
  idx += 'isCustom'.length;
}
