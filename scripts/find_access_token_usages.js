const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

function findUsages(term, limit = 10) {
  let idx = 0;
  let count = 0;
  console.log('=== USAGES FOR: ' + term + ' ===');
  while ((idx = content.indexOf(term, idx)) !== -1 && count < limit) {
    console.log(content.slice(Math.max(0, idx - 50), Math.min(content.length, idx + 150)));
    console.log('------------------------------------');
    idx += term.length;
    count++;
  }
}

findUsages('authorization:`Bearer ${');
findUsages('accessToken:');
