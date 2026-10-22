const fs = require('fs');
const content = fs.readFileSync('C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app/out/main/index.js', 'utf8');

const idx = content.indexOf('class ElevenLabsRuntime');
if (idx === -1) {
  // search for providerId="elevenlabs"
  let pIdx = 0;
  while ((pIdx = content.indexOf('elevenlabs', pIdx)) !== -1) {
    console.log('--- elevenlabs at', pIdx, '---');
    console.log(content.slice(Math.max(0, pIdx - 50), Math.min(content.length, pIdx + 200)));
    pIdx += 10;
  }
} else {
  console.log(content.slice(idx, idx + 1000));
}
