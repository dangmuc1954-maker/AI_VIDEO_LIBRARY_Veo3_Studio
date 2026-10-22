const fs = require('fs');
const mainCode = fs.readFileSync('app/out/main/index.js', 'utf8');

const sIdx = mainCode.indexOf('async transcribeVideoAudio(');
console.log('transcribeVideoAudio in mainCode:');
console.log(mainCode.slice(sIdx, sIdx + 1500));
