const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

const idx = content.indexOf('resourceType');
console.log('resourceType matches:');
let pos = 0;
while ((pos = content.indexOf('resourceType', pos)) !== -1) {
  console.log(content.slice(Math.max(0, pos - 80), Math.min(content.length, pos + 120)));
  console.log('---');
  pos += 12;
}
