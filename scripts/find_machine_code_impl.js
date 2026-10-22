const fs = require('fs');
const code = fs.readFileSync('app/out/main/index.js', 'utf8');

let idx = 0;
while ((idx = code.indexOf('getMachineCode', idx)) !== -1) {
  console.log(`Found getMachineCode at ${idx}:`, code.slice(Math.max(0, idx - 50), Math.min(code.length, idx + 200)));
  idx += 'getMachineCode'.length;
}
