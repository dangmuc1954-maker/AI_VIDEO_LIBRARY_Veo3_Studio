const fs = require('fs');
const path = require('path');

// Let's inspect removeImageWatermark in app/out/main/index.js
// By running a child process with electron or extracting the function
const mainPath = path.resolve('app/out/main/index.js');
const mainCode = fs.readFileSync(mainPath, 'utf8');

// Find Kt class implementation
const startIdx = mainCode.indexOf('class Kt{');
const endIdx = mainCode.indexOf('const Fs=Kt.getInstance();');
console.log('Found Kt from', startIdx, 'to', endIdx);

const ktCode = mainCode.slice(startIdx, endIdx);
fs.writeFileSync('scratch/kt_code.js', ktCode);
console.log('Saved kt_code.js, length:', ktCode.length);
