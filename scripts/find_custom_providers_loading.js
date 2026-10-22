const fs = require('fs');

const content = fs.readFileSync('app/out/renderer/assets/BrowserHub-44JPDUjK.js', 'utf8');

// Find where custom providers are merged with builtin providers
let idx = 0;
while ((idx = content.indexOf('getCustomProviders', idx)) !== -1) {
  console.log('getCustomProviders at', idx);
  console.log(content.slice(Math.max(0, idx - 100), Math.min(content.length, idx + 300)));
  idx += 18;
}

idx = 0;
while ((idx = content.indexOf('providers:', idx)) !== -1) {
  console.log('providers: at', idx);
  console.log(content.slice(Math.max(0, idx - 100), Math.min(content.length, idx + 300)));
  idx += 10;
}
