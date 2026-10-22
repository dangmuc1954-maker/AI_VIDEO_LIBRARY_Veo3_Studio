const fs = require('fs');
const curMain = fs.readFileSync('app/out/main/index.js', 'utf8');

let pos = 0;
while (true) {
  const idx = curMain.indexOf('-an', pos);
  if (idx === -1) break;
  console.log(`-an at ${idx}:`);
  console.log(curMain.slice(Math.max(0, idx - 100), idx + 150));
  pos = idx + 1;
}
