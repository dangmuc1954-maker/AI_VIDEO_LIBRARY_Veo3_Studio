const fs = require('fs');

const c = fs.readFileSync('app/out/main/index.js', 'utf8');
const idx = c.indexOf('class mu{'); // or captchaService
const rIdx = c.indexOf('requestVideoToken(');
console.log('=== requestVideoToken ===');
console.log(c.substring(rIdx - 100, rIdx + 1200));
