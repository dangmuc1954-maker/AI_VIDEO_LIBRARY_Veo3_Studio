const fs = require('fs');
const origCode = fs.readFileSync('extracted_original/out/renderer/assets/VideoStudio-BZY_1pM8.js', 'utf8');

const hIdx = origCode.indexOf('sr($,"video")');
console.log('hIdx (sr):', hIdx);
if (hIdx !== -1) {
  console.log('Original around sr:');
  console.log(origCode.slice(hIdx - 30, hIdx + 120));
}

const sIdx = origCode.indexOf('focus:ring-violet-400');
console.log('sIdx (violet):', sIdx);
if (sIdx !== -1) {
  console.log('Original around violet:');
  console.log(origCode.slice(sIdx - 30, sIdx + 120));
}
