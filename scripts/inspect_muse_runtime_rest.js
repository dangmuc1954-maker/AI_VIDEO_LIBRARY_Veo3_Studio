const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

const idx = content.indexOf('class MuseVideoRuntime');
console.log(content.slice(idx + 2400, idx + 5000));
