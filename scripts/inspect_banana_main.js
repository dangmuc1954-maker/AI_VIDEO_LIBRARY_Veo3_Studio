const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

let pos = 0;
while ((pos = content.indexOf('"banana"', pos)) !== -1) {
  console.log('Found "banana" at:', pos, content.slice(Math.max(0, pos - 50), pos + 100));
  pos += 10;
}
