const fs = require('fs');
const mainCode = fs.readFileSync('app/out/main/index.js', 'utf8');

const matches = [];
let idx = 0;
while ((idx = mainCode.indexOf('captchaService', idx)) !== -1) {
  matches.push({
    pos: idx,
    context: mainCode.slice(Math.max(0, idx - 80), Math.min(mainCode.length, idx + 300))
  });
  idx += 14;
}

console.log('Found', matches.length, 'captchaService occurrences:');
matches.forEach((m, i) => {
  console.log(`\n--- Match #${i + 1} at ${m.pos} ---`);
  console.log(m.context);
});
