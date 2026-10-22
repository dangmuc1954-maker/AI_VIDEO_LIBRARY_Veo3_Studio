const fs = require('fs');
const curMain = fs.readFileSync('app/out/main/index.js', 'utf8');

const sIdx = curMain.indexOf('async syncVoiceoverVideo(');
console.log('Starts at:', sIdx);
// Tìm method tiếp theo sau syncVoiceoverVideo
// Các method của AssetManager: async ...
const afterChunk = curMain.slice(sIdx);
const nextMethod = afterChunk.match(/\n\s*async\s+([a-zA-Z0-9_$]+)\s*\(/g);
console.log('Next methods found:', nextMethod);

// Tìm method tiếp theo không phải muxAudioIntoVideo và transcribeVideoAudio
const regex = /async\s+([a-zA-Z0-9_$]+)\s*\(/g;
let m;
while ((m = regex.exec(afterChunk)) !== null) {
  if (m[1] !== 'syncVoiceoverVideo' && m[1] !== 'muxAudioIntoVideo' && m[1] !== 'transcribeVideoAudio') {
    console.log('Next class method is:', m[1], 'at relative offset:', m.index);
    break;
  }
}
