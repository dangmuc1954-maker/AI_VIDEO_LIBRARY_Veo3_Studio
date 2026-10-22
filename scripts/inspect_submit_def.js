const fs = require('fs');

const c = fs.readFileSync('app/out/main/index.js', 'utf8');
const idx = c.indexOf('async submitVideoWithCaptchaRetry(');
console.log('=== async submitVideoWithCaptchaRetry ===');
console.log(c.substring(idx, idx + 1000));
