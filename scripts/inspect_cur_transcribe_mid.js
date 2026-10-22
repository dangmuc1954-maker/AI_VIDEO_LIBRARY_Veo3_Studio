const fs = require('fs');
const curMain = fs.readFileSync('app/out/main/index.js', 'utf8');

console.log(curMain.slice(689599 + 1500, 689599 + 4000));
