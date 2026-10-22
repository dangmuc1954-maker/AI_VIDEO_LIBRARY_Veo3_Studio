const fs = require('fs');
const code = fs.readFileSync('app/out/renderer/assets/LicenseCenter-CK2ppPZf.js', 'utf8');

const idx = code.indexOf('createPurchaseOrder');
console.log(code.slice(idx - 100, idx + 800));
