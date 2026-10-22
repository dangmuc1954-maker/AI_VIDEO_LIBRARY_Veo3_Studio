const fs = require('fs');
const s = fs.readFileSync('app/out/renderer/assets/VideoStudio-frcr8V6s.js', 'utf8');

const m = s.match(/[A-Za-z0-9_$,\s]*\bUr\b[A-Za-z0-9_$,\s]*from\s*['"][^'"]+['"]/);
console.log('Import statement:', m ? m[0] : 'not found');
