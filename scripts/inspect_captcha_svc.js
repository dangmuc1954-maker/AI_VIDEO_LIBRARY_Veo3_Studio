const fs = require('fs');
const path = require('path');

const code = fs.readFileSync('app/out/main/index.js', 'utf8');

// Find new eh(
const idx = code.indexOf('new eh(');
if (idx !== -1) {
  console.log('--- new eh( context: ---');
  console.log(code.slice(idx - 200, idx + 200));
}

// Find Gu
const guIdx = code.indexOf('Gu=');
if (guIdx !== -1) {
  console.log('--- Gu definition: ---');
  console.log(code.slice(guIdx - 100, guIdx + 100));
}
