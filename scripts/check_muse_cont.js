const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/VideoStudio-frcr8V6s.js', 'utf8');

const idx = 160270;
console.log(content.slice(idx + 500, idx + 1000));
