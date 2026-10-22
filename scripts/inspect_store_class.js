const fs = require('fs');
const content = fs.readFileSync('C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app/out/main/index.js', 'utf8');

console.log(content.slice(417000, 417500));
