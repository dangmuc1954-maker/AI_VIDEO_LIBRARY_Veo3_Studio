const fs = require('fs');
const code = fs.readFileSync('app/out/renderer/assets/VideoStudio-BZY_1pM8.js', 'utf8');

// Find all places where queue jobs are created
// Usually something like: queue.addJob or similar
const matches = [];
let idx = 0;
while ((idx = code.indexOf('payload:', idx)) !== -1) {
  matches.push({
    pos: idx,
    context: code.slice(Math.max(0, idx - 100), Math.min(code.length, idx + 400))
  });
  idx += 8;
}

console.log('Found', matches.length, 'payload: occurrences in VideoStudio:');
matches.forEach((m, i) => {
  console.log(`\n--- Match #${i + 1} at ${m.pos} ---`);
  console.log(m.context);
});
