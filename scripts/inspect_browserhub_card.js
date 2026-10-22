const fs = require('fs');

const content = fs.readFileSync('app/out/renderer/assets/BrowserHub-44JPDUjK.js', 'utf8');

console.log('=== Lines 31600 to 32200 in BrowserHub-44JPDUjK.js ===');
console.log(content.slice(31600, 32300));
