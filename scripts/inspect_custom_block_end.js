const fs = require('fs');
const curMain = fs.readFileSync('app/out/main/index.js', 'utf8');

const sIdx = curMain.indexOf('async syncVoiceoverVideo(');
const eIdx = curMain.indexOf('async editAndMergeVideos(');
console.log('Starts at:', sIdx, 'Ends at:', eIdx);
console.log('Snippet before end:');
console.log(curMain.slice(eIdx - 200, eIdx));
