const fs = require('fs');

const code = fs.readFileSync('app/out/renderer/assets/ImageStudio-4nmpUX3j.js', 'utf8');

console.log('--- FINDING PROVIDER LISTS IN IMAGE STUDIO ---');

// Search for arrays containing Banana
const regex = /\[(?:\"Banana\"|'Banana')[^\]]*\]/g;
let m;
while ((m = regex.exec(code)) !== null) {
  console.log('Found array at', m.index, ':', m[0]);
}

// Search for .map around provider select
const selIdx = code.indexOf('provider:');
console.log('provider: index:', selIdx);

// Search for select items for providers
const bananaIdx = code.indexOf('"Banana"');
let i = 0;
while ((i = code.indexOf('"Banana"', i)) !== -1) {
  console.log('--- "Banana" at', i, '---');
  console.log(code.slice(Math.max(0, i - 60), Math.min(code.length, i + 140)));
  i += 8;
  if (i > 90000) break;
}
