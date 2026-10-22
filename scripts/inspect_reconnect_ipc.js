const fs = require('fs');

const c = fs.readFileSync('app/out/main/index.js', 'utf8');
const idx = c.indexOf('browser:reconnectSession');
console.log('=== browser:reconnectSession ===');
console.log(c.substring(idx - 50, idx + 400));

const aIdx = c.indexOf('browser:attachSession');
console.log('=== browser:attachSession ===');
console.log(c.substring(aIdx - 50, aIdx + 400));
