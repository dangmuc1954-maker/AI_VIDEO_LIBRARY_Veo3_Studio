const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/TTSStudio-C_2cGcBA.js', 'utf8');

console.log('TTSStudio file size:', content.length);
let pos = 0;
while ((pos = content.indexOf('elevenlabs', pos)) !== -1) {
  console.log('elevenlabs in TTSStudio at pos', pos, ':', content.substring(Math.max(0, pos - 50), Math.min(content.length, pos + 300)));
  pos += 10;
}
