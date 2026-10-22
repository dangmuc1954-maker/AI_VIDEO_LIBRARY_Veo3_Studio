const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

const idx = content.indexOf('requeueAutoJobForAlternateAccount');
console.log(content.slice(idx - 500, idx + 500));
