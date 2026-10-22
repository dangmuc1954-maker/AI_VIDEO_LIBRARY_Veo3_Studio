const fs = require('fs');
const code = fs.readFileSync('extracted_original/out/renderer/assets/VideoStudio-BZY_1pM8.js', 'utf8');

const srIdx = code.indexOf('sr($,"video")');
const tblIdx = code.indexOf('max-h-[312px]');

console.log('--- Between sr and table in extracted_original ---');
console.log(code.slice(srIdx, tblIdx));
