const fs = require('fs');

const c = fs.readFileSync('app/out/main/index.js', 'utf8');
const idx = c.indexOf('submitVideoWithCaptchaRetry(');
console.log('=== submitVideoWithCaptchaRetry ===');
console.log(c.substring(idx, idx + 2000));
