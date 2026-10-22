const fs = require('fs');
const content = fs.readFileSync('temp_original_main.js', 'utf8');

const idx = content.lastIndexOf('mB=', 746923);
console.log('mB at ' + idx + ': ' + content.slice(Math.max(0, idx - 20), Math.min(content.length, idx + 100)));
