const fs = require('fs');
const path = require('path');

const curMainPath = path.resolve(__dirname, '../app/out/main/index.js');
const curCode = fs.readFileSync(curMainPath, 'utf8');

const curTransStart = curCode.indexOf('async transcribeVideoAudio(');
console.log('curTransStart:', curTransStart);

// Look for the next async method after transcribeVideoAudio
const after = curCode.slice(curTransStart + 100);
const nextAsync = after.search(/\basync\s+[a-zA-Z0-9_$]+\s*\(/);
console.log('Next async at offset:', nextAsync);
if (nextAsync !== -1) {
  console.log('Next method:', after.slice(nextAsync, nextAsync + 50));
}
