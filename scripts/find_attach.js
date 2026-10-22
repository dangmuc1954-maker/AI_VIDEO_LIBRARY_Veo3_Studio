const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

let pos = 0;
while ((pos = content.indexOf('browser:attachSession', pos)) !== -1) {
  console.log('pos:', pos);
  console.log(content.slice(Math.max(0, pos - 100), pos + 500));
  pos += 21;
}
