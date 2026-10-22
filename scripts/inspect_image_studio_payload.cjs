const fs = require('fs');

const code = fs.readFileSync('app/out/renderer/assets/ImageStudio-4nmpUX3j.js', 'utf8');

// Search for job creation in ImageStudio
const p = code.indexOf('title:');
console.log('Finding payload construction in ImageStudio:');

let pos = 0;
while ((pos = code.indexOf('payload:', pos)) !== -1) {
  console.log(code.slice(Math.max(0, pos - 100), pos + 300));
  console.log('------------------');
  pos += 8;
}
