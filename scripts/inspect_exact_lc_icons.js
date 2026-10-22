const fs = require('fs');
const code = fs.readFileSync('app/out/renderer/assets/LicenseCenter-CK2ppPZf.js', 'utf8');

console.log('--- HEAD OF FILE ---');
console.log(code.slice(0, 1200));

// Find all occurrences of Ta
const taIdx = code.indexOf('function Ta(');
console.log('--- FUNCTION Ta ---');
console.log(code.slice(taIdx - 50, taIdx + 300));
