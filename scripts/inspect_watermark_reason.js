const fs = require('fs');
const mainCode = fs.readFileSync('app/out/main/index.js', 'utf8');

let idx = 0;
while ((idx = mainCode.indexOf('cacheQueueResult', idx)) !== -1) {
  console.log('cacheQueueResult at', idx, ':\n', mainCode.substring(idx - 100, idx + 200));
  idx += 30;
}
