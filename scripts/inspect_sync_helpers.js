const fs = require('fs');
const curMain = fs.readFileSync('app/out/main/index.js', 'utf8');

const syncIdx = curMain.indexOf('async syncVoiceoverVideo(');
console.log('syncVoiceoverVideo at', syncIdx);
if (syncIdx !== -1) {
  console.log(curMain.slice(syncIdx, syncIdx + 3000));
}
