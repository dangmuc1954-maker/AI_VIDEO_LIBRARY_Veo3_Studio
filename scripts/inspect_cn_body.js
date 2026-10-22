const fs = require('fs');
const code = fs.readFileSync('extracted_original/out/renderer/assets/VideoStudio-BZY_1pM8.js', 'utf8');

const cnIdx = code.indexOf('function cn(');
console.log('--- In function cn (2500 - 5500 chars) ---');
console.log(code.slice(cnIdx + 2000, cnIdx + 5000));
