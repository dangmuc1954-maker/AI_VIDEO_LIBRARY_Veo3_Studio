const fs = require('fs');
const content = fs.readFileSync('temp_original_main.js', 'utf8');

const idx = content.indexOf('veo-3.1-lite-low-priority');
console.log(content.slice(Math.max(0, idx - 1000), idx + 2000));
