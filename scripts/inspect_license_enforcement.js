const fs = require('fs');

const content = fs.readFileSync('extracted_original_20260912/out/main/index.js', 'utf8');
console.log(content.slice(775500, 778500));
