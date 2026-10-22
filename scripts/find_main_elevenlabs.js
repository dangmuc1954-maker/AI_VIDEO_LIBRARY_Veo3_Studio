const fs = require('fs');
const mainCode = fs.readFileSync('app/out/main/index.js', 'utf8');

const matches = [];
let idx = 0;
while ((idx = mainCode.indexOf('elevenlabs', idx)) !== -1) {
  matches.push({
    pos: idx,
    context: mainCode.slice(Math.max(0, idx - 100), Math.min(mainCode.length, idx + 400))
  });
  idx += 10;
}

console.log('Found', matches.length, 'elevenlabs occurrences in Main Process:');
matches.forEach((m, i) => {
  console.log(`\n--- Match #${i + 1} at ${m.pos} ---`);
  console.log(m.context);
});
