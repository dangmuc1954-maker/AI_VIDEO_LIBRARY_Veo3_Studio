const fs = require('fs');

const c = fs.readFileSync('app/out/main/index.js', 'utf8');
const idx = c.indexOf('canRun(e)');
if (idx !== -1) {
  console.log(c.substring(idx - 50, idx + 600));
} else {
  const cIdx = c.indexOf('canRun(');
  console.log(c.substring(cIdx - 50, cIdx + 600));
}
