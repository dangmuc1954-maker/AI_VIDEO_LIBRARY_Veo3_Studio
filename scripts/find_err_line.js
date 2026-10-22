const fs = require('fs');
const vm = require('vm');
const code = fs.readFileSync('app/out/main/index.js', 'utf8');
const lines = code.split('\n');

// Find which lines contains 'catch'
const catchLines = [];
lines.forEach((l, i) => {
  if (l.includes('catch')) {
    catchLines.push(i + 1);
  }
});
console.log('Lines containing catch:', catchLines.length);

// Let's test compiling individual functions or check the lines modified recently
// Lines 3000 to 4000
catchLines.forEach(lineNum => {
  const l = lines[lineNum - 1];
  if (l.includes('Watermark') || l.includes('watermark') || l.includes('_cln') || l.includes('_vErr') || l.includes('_dErr') || l.includes('_postErr')) {
    console.log(`Line ${lineNum}: ${l.substring(0, 150)}...`);
  }
});
