const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/VideoStudio-frcr8V6s.js', 'utf8');
const idx = content.indexOf('let he,Ve;if(v.mode==="Frames")');
console.log(content.slice(idx, idx + 1200));
