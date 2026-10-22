const fs = require('fs');
const mainCode = fs.readFileSync('app/out/main/index.js', 'utf8');

const sIdx = mainCode.indexOf('async transcribeVideoAudio(');
const eIdx = mainCode.indexOf('async editAndMergeVideos(');
const block = mainCode.slice(sIdx, eIdx);

console.log(block);
