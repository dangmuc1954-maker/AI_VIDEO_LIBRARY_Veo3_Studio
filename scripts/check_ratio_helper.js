const fs = require('fs');

const main = fs.readFileSync('app/out/main/index.js', 'utf8');
const p = main.indexOf('mimeType:"video/mp4"');
console.log('mimeType:"video/mp4" at', p);
if (p !== -1) {
  console.log(main.slice(p - 100, p + 200));
}
