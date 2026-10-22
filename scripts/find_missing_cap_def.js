const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

const idx = content.indexOf('missingCapabilityForJob(');
let pos = 0;
while ((pos = content.indexOf('missingCapabilityForJob', pos)) !== -1) {
  console.log('pos:', pos);
  console.log(content.slice(Math.max(0, pos - 50), pos + 250));
  pos += 23;
}
