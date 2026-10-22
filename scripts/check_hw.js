const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

const idx = content.indexOf('class hw{constructor(e){');
console.log(content.substring(idx, idx + 300));
