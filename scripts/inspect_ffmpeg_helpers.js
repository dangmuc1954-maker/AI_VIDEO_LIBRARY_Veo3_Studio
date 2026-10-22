const fs = require('fs');
const curMain = fs.readFileSync('app/out/main/index.js', 'utf8');

// Xem hàm mergeAudios hoặc mergeVideos hoặc concatenateClips trong curMain dùng những hàm nào cho ffmpeg!
const mergeIdx = curMain.indexOf('async mergeAudios');
console.log('mergeAudios at', mergeIdx);
if (mergeIdx !== -1) {
  console.log(curMain.slice(mergeIdx, mergeIdx + 2000));
}
