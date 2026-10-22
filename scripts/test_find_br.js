const fs = require('fs');
const code = fs.readFileSync('app/out/main/index.js', 'utf8');
const idx = code.indexOf('ffmpeg-static');
console.log('ffmpeg-static around:', code.substring(idx - 50, idx + 100));
