const fs = require('fs');
const mainCode = fs.readFileSync('app/out/main/index.js', 'utf8');

const matches = [];
let idx = 0;
while ((idx = mainCode.indexOf('runtimes.get', idx)) !== -1) {
  matches.push({
    pos: idx,
    context: mainCode.slice(Math.max(0, idx - 80), Math.min(mainCode.length, idx + 200))
  });
  idx += 12;
}

console.log('Found', matches.length, 'runtimes.get occurrences in Main Process:');
matches.forEach((m, i) => {
  console.log(`\n--- Match #${i + 1} at ${m.pos} ---`);
  console.log(m.context);
});
