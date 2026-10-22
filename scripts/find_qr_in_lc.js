const fs = require('fs');
const code = fs.readFileSync('app/out/renderer/assets/LicenseCenter-CK2ppPZf.js', 'utf8');

// Find occurrences of QR or payment or checkout
let idx = 0;
while ((idx = code.indexOf('qr', idx)) !== -1) {
  const snippet = code.slice(Math.max(0, idx - 40), Math.min(code.length, idx + 80));
  if (snippet.includes('qrImageUrl') || snippet.includes('lc-order') || snippet.includes('qrCode') || snippet.includes('bank')) {
    console.log(`Found at ${idx}:`, snippet);
  }
  idx += 2;
}
