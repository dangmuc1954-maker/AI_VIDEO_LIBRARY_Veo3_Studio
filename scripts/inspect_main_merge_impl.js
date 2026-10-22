const fs = require('fs');

const mainIndex = fs.readFileSync('C:/Users/admin/.gemini/antigravity-ide/brain/989bde5b-7b0e-4357-b6e0-e795ccef2b41/scratch/aiforge_out/out/main/index.js', 'utf-8');

// Find mergeVideos implementation starting around 419876
const idx = mainIndex.indexOf('async mergeVideos(', 410000);
console.log('mergeVideos index:', idx);
console.log(mainIndex.substring(idx, idx + 4000));

const idxEdit = mainIndex.indexOf('async editAndMergeVideos(', 410000);
console.log('editAndMergeVideos index:', idxEdit);
console.log(mainIndex.substring(idxEdit, idxEdit + 4000));
