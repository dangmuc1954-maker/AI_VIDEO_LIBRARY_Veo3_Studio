const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

const idx = content.indexOf('isUsableAutomationSurface(');
console.log(content.slice(idx - 100, idx + 1000));
