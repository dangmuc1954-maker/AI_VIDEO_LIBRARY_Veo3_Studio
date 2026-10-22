const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/VideoStudio-frcr8V6s.js', 'utf8');

const idx = 162623;
console.log(content.slice(idx - 1000, idx + 200));
