const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

const idx = content.indexOf('const probe = await wc.executeJavaScript');
console.log(content.slice(idx, idx + 2500));
