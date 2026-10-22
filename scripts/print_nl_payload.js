const fs = require('fs');
const curMain = fs.readFileSync('app/out/main/index.js', 'utf8');

console.log(curMain.slice(116849 + 2500, 116849 + 6000));
