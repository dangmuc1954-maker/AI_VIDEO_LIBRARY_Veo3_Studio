const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

let pos = 0;
while ((pos = content.indexOf('.status==="Queued"', pos)) !== -1) {
  console.log('Queued check at', pos);
  console.log(content.slice(Math.max(0, pos - 50), pos + 200));
  pos += 18;
}
