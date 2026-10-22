const fs = require('fs');
const mainCode = fs.readFileSync('app/out/main/index.js', 'utf8');

const anchor = 'const c=await this.assets.cacheQueueResult(n,a);';
const cIdx = mainCode.indexOf(anchor);
const endAnchor = 'const d=this.queue.findJob(e.id);';
const dIdx = mainCode.indexOf(endAnchor, cIdx);

console.log('--- CURRENT MERGE BLOCK ---');
console.log(mainCode.slice(cIdx, dIdx + endAnchor.length));
