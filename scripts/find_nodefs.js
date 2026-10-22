const fs = require('fs');
const target = 'C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app/out/main/index.js';
const content = fs.readFileSync(target, 'utf8');

const matches = [];
let idx = 0;
while ((idx = content.indexOf('nodeFs', idx)) !== -1) {
  matches.push({
    index: idx,
    snippet: content.slice(Math.max(0, idx - 40), Math.min(content.length, idx + 40))
  });
  idx += 6;
}

console.log('Matches for nodeFs:', JSON.stringify(matches, null, 2));
