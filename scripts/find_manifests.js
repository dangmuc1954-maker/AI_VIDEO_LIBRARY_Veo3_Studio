const fs = require('fs');

const indexDqhu = fs.readFileSync('C:/Users/admin/.gemini/antigravity-ide/brain/989bde5b-7b0e-4357-b6e0-e795ccef2b41/scratch/aiforge_out/out/renderer/assets/index-DqhuWq2K.js', 'utf-8');

let idx = 0;
while ((idx = indexDqhu.indexOf('autoMergeRunManifests', idx)) !== -1) {
  console.log(`At ${idx}:`);
  console.log(indexDqhu.substring(Math.max(0, idx - 200), Math.min(indexDqhu.length, idx + 500)));
  console.log('---');
  idx += 'autoMergeRunManifests'.length;
}
