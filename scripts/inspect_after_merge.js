const fs = require('fs');
const mainCode = fs.readFileSync('app/out/main/index.js', 'utf8');

const cIdx = mainCode.indexOf('cacheQueueResult');
console.log(mainCode.slice(cIdx + 3000, cIdx + 6000));
