const fs = require('fs');
const code = fs.readFileSync('app/out/renderer/assets/VideoStudio-BZY_1pM8.js', 'utf8');

const matches = [];
let idx = 0;
while ((idx = code.indexOf('providerId:', idx)) !== -1) {
  matches.push({
    pos: idx,
    context: code.slice(Math.max(0, idx - 60), Math.min(code.length, idx + 450))
  });
  idx += 11;
}

console.log('Found', matches.length, 'providerId occurrences in VideoStudio:');
matches.forEach((m, i) => {
  console.log(`\n--- Match #${i + 1} at ${m.pos} ---`);
  console.log(m.context);
});
