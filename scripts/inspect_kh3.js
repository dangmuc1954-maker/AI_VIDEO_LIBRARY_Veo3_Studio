const fs = require('fs');
const path = 'dist/AI_VIDEO_LIBRARY_Khach_Hang_v3.0/resources/app/out/renderer/assets/VideoStudio-BZY_1pM8.js';
const code = fs.readFileSync(path, 'utf8');

const srIdx = code.indexOf('sr($,"video")');
const tblIdx = code.indexOf('max-h-[312px]');

console.log('--- Between sr and table in Khach_Hang_v3.0 ---');
console.log(code.slice(srIdx, tblIdx));

const cnIdx = code.indexOf('function cn(');
console.log('\n--- In function cn (first 1500 chars) ---');
console.log(code.slice(cnIdx, cnIdx + 1500));
