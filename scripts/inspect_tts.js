const fs = require('fs');
const code = fs.readFileSync('app/out/main/index.js', 'utf8');

console.log('=== FINDING ELEVENLABS RUNNERS IN MAIN ===');
let pos = 0;
while (true) {
  let idx = code.indexOf('elevenlabs', pos);
  if (idx === -1) break;
  console.log(`\n--- Match at pos ${idx} ---`);
  console.log(code.slice(Math.max(0, idx - 150), Math.min(code.length, idx + 250)));
  pos = idx + 'elevenlabs'.length;
}
