const fs = require('fs');
const content = fs.readFileSync('scripts/extracted/main_index.js', 'utf-8');

console.log(content.substring(815000, 816380));
