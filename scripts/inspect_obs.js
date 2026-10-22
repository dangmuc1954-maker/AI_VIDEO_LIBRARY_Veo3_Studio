const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

const idx = content.indexOf('onBeforeSendHeaders');
console.log('--- onBeforeSendHeaders at ' + idx + ' ---');
console.log(content.slice(idx - 100, idx + 600));
