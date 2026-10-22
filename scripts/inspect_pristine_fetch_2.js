const fs = require('fs');

const c = fs.readFileSync('dist/AI_VIDEO_LIBRARY_Khach_Hang_v3.0/resources/app/out/main/index.js', 'utf8');
const start = c.indexOf('async fetchAccessToken(');
console.log(c.substring(start + 2500, start + 4500));
