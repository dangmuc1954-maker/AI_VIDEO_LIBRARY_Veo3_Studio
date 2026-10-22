const fs = require('fs');

const orig = fs.readFileSync('temp_original_main.js', 'utf8');

const idx = orig.indexOf('async fetchAccessToken(');
console.log(orig.substring(idx, idx + 2000));
