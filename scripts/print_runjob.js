const fs = require('fs');
const curMain = fs.readFileSync('app/out/main/index.js', 'utf8');

console.log(curMain.slice(335119 + 1200, 335119 + 6000));
