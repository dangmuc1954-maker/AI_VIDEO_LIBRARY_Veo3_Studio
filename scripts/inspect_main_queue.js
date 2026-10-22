const fs = require('fs');
const mainCode = fs.readFileSync('app/out/main/index.js', 'utf8');

const cIdx = mainCode.indexOf('cacheQueueResult');
console.log('--- Around cacheQueueResult (2500 chars) ---');
console.log(mainCode.slice(cIdx - 200, cIdx + 2300));
