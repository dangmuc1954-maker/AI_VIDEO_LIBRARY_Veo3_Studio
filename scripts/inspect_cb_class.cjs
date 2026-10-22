const fs = require('fs');
const content = fs.readFileSync('scripts/extracted/main_index.js', 'utf-8');

// Find cB definition and request method
const idx = content.indexOf('class cB');
console.log('class cB at:', idx);
console.log(content.substring(idx, idx + 2500));
