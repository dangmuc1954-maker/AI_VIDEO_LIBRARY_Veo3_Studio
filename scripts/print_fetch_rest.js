const fs = require('fs');

const c = fs.readFileSync('app/out/main/index.js', 'utf8');
const idx = c.indexOf('for(let step=0;step<6;step+=1){');
console.log(c.substring(idx, idx + 2000));
