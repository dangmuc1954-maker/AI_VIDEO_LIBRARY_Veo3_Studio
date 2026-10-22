const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

console.log(content.slice(260700, 262000));
