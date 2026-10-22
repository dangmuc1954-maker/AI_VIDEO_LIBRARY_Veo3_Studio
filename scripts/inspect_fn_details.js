const fs = require('fs');
const pristinePath = 'dist/AI_VIDEO_LIBRARY_Khach_Hang_v3.0/resources/app/out/renderer/assets/VideoStudio-BZY_1pM8.js';
const origCode = fs.readFileSync(pristinePath, 'utf8');

const tableAnchor = 'max-h-[312px]';
const tIdx = origCode.indexOf(tableAnchor);
const fnStart = origCode.lastIndexOf('function ', tIdx);
const fnEnd = origCode.indexOf('function ', tIdx + 50);

console.log('Function declaration:');
console.log(origCode.slice(fnStart, fnStart + 200));

console.log('\nAround tableAnchor (before 200, after 200):');
console.log(origCode.slice(tIdx - 200, tIdx + 200));
