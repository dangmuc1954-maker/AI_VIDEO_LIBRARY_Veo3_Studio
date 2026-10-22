const fs = require('fs');
const code = fs.readFileSync('app/out/renderer/assets/VideoStudio-BZY_1pM8.js', 'utf8');

console.log('Searching for addJob in VideoStudio...');
let pos = 0;
while (true) {
  let idx = code.indexOf('payload:', pos);
  if (idx === -1) break;
  console.log(`\n--- Match at pos ${idx} ---`);
  console.log(code.slice(Math.max(0, idx - 100), Math.min(code.length, idx + 350)));
  pos = idx + 8;
}
