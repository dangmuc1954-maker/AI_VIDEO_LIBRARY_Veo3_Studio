const fs = require('fs');
const code = fs.readFileSync('app/out/renderer/assets/LicenseCenter-CK2ppPZf.js', 'utf8');

const regex = /Ta\(/g;
let m;
while ((m = regex.exec(code)) !== null) {
  console.log(`Ta( at ${m.index}: ${code.slice(Math.max(0, m.index - 50), Math.min(code.length, m.index + 100))}`);
}
