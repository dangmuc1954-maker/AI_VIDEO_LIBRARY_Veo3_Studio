const fs = require('fs');

const content = fs.readFileSync('app/out/renderer/assets/BrowserHub-44JPDUjK.js', 'utf8');

console.log('=== Lines 37600 to 38000 ===');
console.log(content.slice(37600, 38100));

console.log('=== Lines 41200 to 41500 ===');
console.log(content.slice(41200, 41550));
