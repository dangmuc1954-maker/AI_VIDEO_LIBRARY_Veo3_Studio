const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

let pos = 0;
while (true) {
  const idx = content.indexOf('nodePath', pos);
  if (idx === -1) break;
  console.log(`nodePath at ${idx}:`);
  console.log(content.slice(Math.max(0, idx - 40), idx + 100));
  pos = idx + 1;
}
