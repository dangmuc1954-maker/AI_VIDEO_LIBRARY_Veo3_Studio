const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/VideoStudio-frcr8V6s.js', 'utf8');

const pos = content.indexOf('function Gi(');
console.log(content.slice(pos, pos + 500));
