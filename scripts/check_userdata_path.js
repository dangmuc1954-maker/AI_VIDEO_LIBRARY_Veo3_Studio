const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

let pos = 0;
while ((pos = content.indexOf('getPath("userData")', pos)) !== -1) {
  console.log('getPath(userData) at', pos);
  console.log(content.slice(Math.max(0, pos - 50), pos + 150));
  pos += 18;
}
