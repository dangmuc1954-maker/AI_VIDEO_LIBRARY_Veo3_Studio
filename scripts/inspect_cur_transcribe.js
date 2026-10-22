const fs = require('fs');
const path = require('path');

// Xem chính xác hàm transcribeVideoAudio trong app/out/main/index.js
const curMain = fs.readFileSync('app/out/main/index.js', 'utf8');
const sIdx = curMain.indexOf('async transcribeVideoAudio(videoAssetId');
console.log('transcribeVideoAudio in curMain at', sIdx);
if (sIdx !== -1) {
  console.log(curMain.slice(sIdx, sIdx + 2000));
} else {
  console.log('NOT FOUND transcribeVideoAudio in curMain!');
}
