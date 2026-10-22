const fs = require('fs');
const mainCode = fs.readFileSync('app/out/main/index.js', 'utf8');

const cIdx = mainCode.indexOf('async cacheQueueResult(');
if (cIdx !== -1) {
  console.log('--- cacheQueueResult Definition (1500 chars) ---');
  console.log(mainCode.slice(cIdx, cIdx + 1500));
} else {
  const cIdx2 = mainCode.indexOf('cacheQueueResult(');
  console.log('--- cacheQueueResult Definition (1500 chars) ---');
  console.log(mainCode.slice(cIdx2, cIdx2 + 1500));
}
