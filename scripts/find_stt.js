const fs = require('fs');
const content = fs.readFileSync('C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app/out/main/index.js', 'utf8');

let idx = 0;
while ((idx = content.indexOf('STT', idx)) !== -1) {
  console.log('--- STT at', idx, '---');
  console.log(content.slice(Math.max(0, idx - 50), Math.min(content.length, idx + 200)));
  idx += 3;
}
