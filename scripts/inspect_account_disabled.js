const fs = require('fs');
const c = fs.readFileSync('app/out/main/index.js', 'utf8');
const p = c.indexOf('browser:setAccountDisabled');
console.log(c.slice(p - 100, p + 400));
