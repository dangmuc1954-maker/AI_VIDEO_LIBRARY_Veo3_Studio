const fs = require('fs');
const mainCode = fs.readFileSync('app/out/main/index.js', 'utf8');

const wIdx = mainCode.indexOf('const a=await this.writeAsset(');
console.log('--- cacheQueueAsset return (1500 chars) ---');
console.log(mainCode.slice(wIdx, wIdx + 1500));
