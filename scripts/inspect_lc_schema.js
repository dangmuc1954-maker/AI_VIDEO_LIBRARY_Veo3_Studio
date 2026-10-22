const fs = require('fs');
const path = require('path');

const lcPath = path.join(__dirname, '../app/out/renderer/assets/LicenseCenter-D-RJQ6lX.js');
const lcJs = fs.readFileSync(lcPath, 'utf8');

// Find plan parsing function ba(r)
const idx = lcJs.indexOf('function ba(');
if (idx !== -1) {
  console.log('--- Plan Parsing Function ba() ---');
  console.log(lcJs.slice(idx, idx + 1500));
}

// Find order creation and formatting
const idxOrder = lcJs.indexOf('createPurchaseOrder');
if (idxOrder !== -1) {
  console.log('\n--- createPurchaseOrder in UI ---');
  console.log(lcJs.slice(idxOrder - 200, idxOrder + 800));
}
