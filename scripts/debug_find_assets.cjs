const fs = require('fs');
const s = fs.readFileSync('app/out/main/index.js', 'utf8');

const rIdx = s.indexOf('removeJobs(');
console.log('--- U.removeJobs ---');
console.log(s.slice(rIdx - 50, rIdx + 600));

let pos = 0;
console.log('\n--- queue IPC handlers ---');
while ((pos = s.indexOf('"queue:', pos)) !== -1) {
  console.log(s.slice(pos, pos + 100));
  pos += 7;
}
