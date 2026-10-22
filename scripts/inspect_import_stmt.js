const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/VideoStudio-frcr8V6s.js', 'utf8');
const idx = content.indexOf('import {');
console.log(content.slice(idx, idx + 400));
