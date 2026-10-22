const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

let pos = 0;
while ((pos = content.indexOf('new im(', pos)) !== -1) {
  console.log('new im at', pos);
  console.log(content.slice(pos, pos + 800));
  pos += 7;
}
