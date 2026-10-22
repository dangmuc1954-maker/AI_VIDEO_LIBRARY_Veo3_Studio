const fs = require('fs');
const path = require('path');

const mainJs = fs.readFileSync(path.join(__dirname, '../app/out/main/index.js'), 'utf8');

const target = 275269;
console.log(mainJs.slice(target - 1500, target + 100));
