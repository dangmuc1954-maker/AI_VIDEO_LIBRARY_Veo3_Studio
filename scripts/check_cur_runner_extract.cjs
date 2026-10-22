const fs = require('fs');
const code = fs.readFileSync('app/out/renderer/assets/useWorkflowRunner-DGw6Ekx4.js', 'utf8');

const target = 'Đưa sang ElevenLabs';
const idx = code.indexOf(target);
console.log('Index:', idx);
if (idx !== -1) {
  console.log(code.slice(idx - 200, idx + 400));
} else {
  // find by video-script-extract
  const sIdx = code.indexOf('video-script-extract');
  console.log(code.slice(sIdx, sIdx + 1500));
}
