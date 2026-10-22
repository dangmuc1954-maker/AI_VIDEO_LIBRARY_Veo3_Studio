const fs = require('fs');
const code = fs.readFileSync('app/out/renderer/assets/LicenseCenter-CK2ppPZf.js', 'utf8');

console.log(code.slice(27000, 31500));
