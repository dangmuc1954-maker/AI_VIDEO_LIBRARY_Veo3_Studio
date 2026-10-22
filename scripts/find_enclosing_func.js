const fs = require('fs');

const content = fs.readFileSync('app/out/renderer/assets/VideoStudio-BZY_1pM8.js', 'utf8');
const idx = content.indexOf('children:"Video Queue"');
console.log('Video Queue index:', idx);

// Search backwards for the function declaration enclosing Video Queue
const before = content.slice(0, idx);
const lastFuncIdx = before.lastIndexOf('function ');
console.log('Enclosing function at:', lastFuncIdx);
console.log(content.slice(lastFuncIdx, lastFuncIdx + 200));
