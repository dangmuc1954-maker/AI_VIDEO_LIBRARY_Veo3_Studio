// scripts/find_banana_veo3_splits.js
const fs = require('fs');

const mainCode = fs.readFileSync('app/out/main/index.js', 'utf8');

function searchMatches(code, label, target) {
  console.log(`\n=== Matches for ${label} in app/out/main/index.js ===`);
  let pos = 0;
  let count = 0;
  while ((pos = code.indexOf(target, pos)) !== -1) {
    count++;
    console.log(`[${count}] at ${pos}: ${code.slice(Math.max(0, pos - 60), Math.min(code.length, pos + target.length + 60))}`);
    pos += target.length;
  }
}

searchMatches(mainCode, 'banana provider check', 'providerId==="banana"');
searchMatches(mainCode, 'veo3 provider check', 'providerId==="veo3"');
searchMatches(mainCode, 'Selected account does not belong to Google Flow', 'Selected account does not belong to Google Flow');
