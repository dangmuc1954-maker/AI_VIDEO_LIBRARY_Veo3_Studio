const fs = require('fs');
const pristinePath = 'dist/AI_VIDEO_LIBRARY_Khach_Hang_v3.0/resources/app/out/renderer/assets/VideoStudio-BZY_1pM8.js';
const origCode = fs.readFileSync(pristinePath, 'utf8');

const lnIdx = origCode.indexOf('function ln(');
// Find the next top-level function after lnIdx
let endIdx = origCode.indexOf('\nfunction ', lnIdx);
if (endIdx === -1) endIdx = origCode.indexOf(';function ', lnIdx);
if (endIdx === -1) endIdx = origCode.indexOf('function ', lnIdx + 10);

console.log('ln start:', lnIdx, 'ln end:', endIdx);
console.log('lnCode:\n', origCode.slice(lnIdx, endIdx));
