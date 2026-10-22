const fs = require('fs');

const content = fs.readFileSync('app/out/renderer/assets/BrowserHub-44JPDUjK.js', 'utf8');

console.log('=== Lines around 3400-3600 ===');
console.log(content.slice(3350, 3700));

console.log('=== Lines around 5300-5550 ===');
console.log(content.slice(5250, 5600));
