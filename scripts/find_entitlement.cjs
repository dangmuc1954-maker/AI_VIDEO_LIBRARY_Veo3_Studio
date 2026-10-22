const fs = require('fs');
const content = fs.readFileSync('scripts/extracted/main_index.js', 'utf-8');

let pos = 0;
while ((pos = content.indexOf('withFreshEntitlement', pos)) !== -1) {
  console.log('Found withFreshEntitlement at:', pos);
  console.log(content.substring(Math.max(0, pos - 150), Math.min(content.length, pos + 350)));
  console.log('------------------------------------');
  pos += 20;
}
