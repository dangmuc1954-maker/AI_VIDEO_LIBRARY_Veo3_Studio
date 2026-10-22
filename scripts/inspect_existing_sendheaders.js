const fs = require('fs');

const c = fs.readFileSync('app/out/main/index.js', 'utf8');
const idx = c.indexOf('onBeforeSendHeaders');
console.log('=== onBeforeSendHeaders ===');
console.log(c.substring(idx - 200, idx + 400));
