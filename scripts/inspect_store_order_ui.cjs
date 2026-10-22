const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'app', 'out', 'renderer', 'assets', 'WorkflowStore-BIvOZ42B.js');
const s = fs.readFileSync(filePath, 'utf-8');

// Search for createOrder, qrImageUrl, checkOrder, orderCode
const terms = ['createOrder', 'qrImageUrl', 'checkOrder', 'orderCode', 'transferContent'];
terms.forEach(t => {
  let idx = 0;
  while ((idx = s.indexOf(t, idx)) !== -1) {
    console.log(`Found "${t}" at ${idx}:`);
    console.log(s.substring(Math.max(0, idx - 100), Math.min(s.length, idx + 250)));
    console.log('------------------------------------');
    idx += t.length + 10;
  }
});
