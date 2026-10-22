const fs = require('fs');
const pristinePath = 'dist/AI_VIDEO_LIBRARY_Khach_Hang_v3.0/resources/app/out/renderer/assets/VideoStudio-BZY_1pM8.js';
const origCode = fs.readFileSync(pristinePath, 'utf8');

// Let's test eval on each function in VideoStudio
// Let's split by 'function ' and see where the syntax breaks!
const parts = origCode.split('function ');
console.log('Total functions in file:', parts.length);

for (let i = 1; i < parts.length; i++) {
  const fnCode = 'function ' + parts[i].slice(0, parts[i].indexOf(';return') + 100);
}

// Let's test the component where tableAnchor resides
const tableAnchor = 'e.jsx("div",{ref:w,className:"max-h-[312px] overflow-auto"';
const tIdx = origCode.indexOf(tableAnchor);

// Find the function enclosing tableAnchor
const fnStart = origCode.lastIndexOf('function ', tIdx);
const nextFnStart = origCode.indexOf('function ', tIdx + 100);
console.log('Enclosing function length:', nextFnStart - fnStart);
const fnBody = origCode.slice(fnStart, nextFnStart);

console.log('Testing enclosing function without banner...');
try {
  eval('(' + fnBody + ')');
  console.log('Enclosing function WITHOUT banner is valid!');
} catch (e) {
  console.log('Enclosing function WITHOUT banner error:', e.message);
}
