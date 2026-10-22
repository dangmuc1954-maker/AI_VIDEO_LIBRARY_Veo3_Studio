const fs = require('fs');

const mainCode = fs.readFileSync('app/out/main/index.js', 'utf8');
const regex = /muse\.ai[^\s"'`]*/g;
const matches = [...new Set(mainCode.match(regex) || [])];
console.log('Unique muse.ai URLs in main:', matches);

// Check provider definitions
const pIdx = mainCode.indexOf('providerId==="muse"');
console.log('providerId==="muse":', pIdx);
if (pIdx !== -1) {
  console.log(mainCode.slice(pIdx - 100, pIdx + 300));
}
