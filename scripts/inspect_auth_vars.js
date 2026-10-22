const fs = require('fs');

const curr = fs.readFileSync('app/out/main/index.js', 'utf8');

// Check definition of readSessionToken or surrounding methods in GoogleFlowAuthService
const idx = curr.indexOf('readSessionToken(');
console.log('=== AROUND readSessionToken ===');
console.log(curr.substring(idx - 200, idx + 400));
