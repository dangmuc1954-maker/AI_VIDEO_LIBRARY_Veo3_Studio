const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/VideoStudio-frcr8V6s.js', 'utf8');

const idx = content.indexOf('xe.filter(r=>ss(r)&&!rs(r))');
console.log(content.slice(idx - 300, idx + 100));
