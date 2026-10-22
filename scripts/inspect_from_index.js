const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/VideoStudio-frcr8V6s.js', 'utf8');
const idx = content.indexOf('from "./index-');
console.log(content.slice(Math.max(0, idx - 200), idx + 200));
