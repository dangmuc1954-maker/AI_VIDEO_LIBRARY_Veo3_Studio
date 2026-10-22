const fs = require('fs');
const path = require('path');

const vsPath = path.join(__dirname, '../app/out/renderer/assets/VideoStudio-BZY_1pM8.js');
const code = fs.readFileSync(vsPath, 'utf8');

const lines = code.split('\n');
console.log('Total lines:', lines.length);
if (lines.length >= 830) {
  console.log('Line 829:', lines[828].substring(0, 100));
  console.log('Line 830 length:', lines[829].length);
  // Find where the error is by slicing
  console.log('Line 831:', lines[830] ? lines[830].substring(0, 100) : 'EOF');
}
