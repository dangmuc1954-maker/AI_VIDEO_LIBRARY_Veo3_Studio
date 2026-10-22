const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf-8');

const idx = content.indexOf('new cB');
if (idx !== -1) {
  console.log('new cB call:');
  console.log(content.substring(idx - 100, idx + 200));
} else {
  console.log('new cB not found');
}
