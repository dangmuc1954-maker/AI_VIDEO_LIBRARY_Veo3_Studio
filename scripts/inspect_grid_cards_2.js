const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/VideoStudio-frcr8V6s.js', 'utf8');

console.log(content.slice(57500, 61500));
