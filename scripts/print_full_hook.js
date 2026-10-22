const fs = require('fs');

const c = fs.readFileSync('app/out/main/index.js', 'utf8');
const idx = c.indexOf('onBeforeSendHeaders');
console.log(c.substring(idx - 50, idx + 1200));
