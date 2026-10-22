const fs = require('fs');

const c = fs.readFileSync('app/out/main/index.js', 'utf8');

// Find GoogleFlowAuthService class
const startIdx = c.indexOf('class fe{'); // or similar
const fetchIdx = c.indexOf('async fetchAccessToken(');
console.log('=== GoogleFlowAuthService methods around fetchAccessToken ===');
console.log(c.substring(fetchIdx - 500, fetchIdx + 1500));
