const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/VideoStudio-BZY_1pM8.js', 'utf8');

const idx = content.indexOf('const He =');
console.log(content.substring(idx - 200, idx + 100));
