const fs = require('fs');

console.log('=== 1. PRELOAD EXPOSURE IN ZIP3 ===');
const zip3Preload = fs.readFileSync('scratch/zip3_source_app/resources/app/out/preload/index.cjs', 'utf8');
let pIdx = zip3Preload.indexOf('syncVoiceoverVideo');
if (pIdx !== -1) {
  console.log(zip3Preload.slice(pIdx - 100, pIdx + 300));
}

console.log('\n=== 2. MAIN IPC / METHODS IN ZIP3 ===');
const zip3Main = fs.readFileSync('scratch/zip3_source_app/resources/app/out/main/index.js', 'utf8');
let mIdx = zip3Main.indexOf('syncVoiceoverVideo(');
if (mIdx !== -1) {
  console.log('Found syncVoiceoverVideo in main at', mIdx);
  console.log(zip3Main.slice(mIdx - 50, mIdx + 1500));
}

let tIdx = zip3Main.indexOf('transcribeVideoAudio(');
if (tIdx !== -1) {
  console.log('Found transcribeVideoAudio in main at', tIdx);
  console.log(zip3Main.slice(tIdx - 50, tIdx + 1500));
}
