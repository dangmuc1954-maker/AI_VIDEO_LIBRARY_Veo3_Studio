const fs = require('fs');
const curMain = fs.readFileSync('app/out/main/index.js', 'utf8');

const sIdx = curMain.indexOf('async syncVoiceoverVideo(');
const eIdx = curMain.indexOf('async mergeAudios(', sIdx);
console.log('Current custom functions length:', eIdx - sIdx);
console.log('Starts at:', sIdx, 'Ends at:', eIdx);
