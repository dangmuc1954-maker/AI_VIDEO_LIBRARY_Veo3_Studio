const fs = require('fs');
const mainCode = fs.readFileSync('app/out/main/index.js', 'utf8');

const wIdx = mainCode.indexOf('async writeAsset(');
console.log('--- writeAsset (1500 chars) ---');
console.log(mainCode.slice(wIdx, wIdx + 1500));
