const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/VideoStudio-frcr8V6s.js', 'utf8');
const idx = content.indexOf('from "./index-');
console.log('idx:', idx);
console.log('slice:', content.slice(idx - 100, idx + 100));
