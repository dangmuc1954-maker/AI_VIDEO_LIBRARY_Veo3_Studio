const fs = require('fs');
const content = fs.readFileSync('C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app/out/main/index.js', 'utf8');

let idx = 0;
while ((idx = content.indexOf('xi-api-key', idx)) !== -1) {
  console.log('--- FOUND at', idx, '---');
  console.log(content.slice(Math.max(0, idx - 100), Math.min(content.length, idx + 400)));
  idx += 10;
}
