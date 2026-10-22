const fs = require('fs');

const mainIndex = fs.readFileSync('C:/Users/admin/.gemini/antigravity-ide/brain/989bde5b-7b0e-4357-b6e0-e795ccef2b41/scratch/aiforge_out/out/main/index.js', 'utf-8');

let idx = 0;
while ((idx = mainIndex.indexOf('mergeVideos', idx)) !== -1) {
  console.log(`mergeVideos at ${idx}:`);
  console.log(mainIndex.substring(Math.max(0, idx - 200), Math.min(mainIndex.length, idx + 600)));
  console.log('===');
  idx += 'mergeVideos'.length;
}
