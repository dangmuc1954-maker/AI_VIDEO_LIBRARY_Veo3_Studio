const fs = require('fs');
const code = fs.readFileSync('app/out/renderer/assets/LicenseCenter-CK2ppPZf.js', 'utf8');

const idx = code.indexOf('.lc-plan-icon-container');
console.log(code.slice(idx, idx + 400));
