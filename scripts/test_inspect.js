const fs = require('fs');
const mainCode = fs.readFileSync('app/out/main/index.js', 'utf8');

console.log(mainCode.substring(753500, 755000));
