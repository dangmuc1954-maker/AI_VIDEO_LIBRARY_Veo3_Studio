const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

let pos = 0;
let count = 0;
while ((pos = content.indexOf('custom-', pos)) !== -1 && count < 10) {
  console.log(`custom- at ${pos}:`);
  console.log(content.slice(Math.max(0, pos - 50), pos + 150));
  pos += 7;
  count++;
}
