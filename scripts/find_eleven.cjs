const fs = require('fs');
const curCode = fs.readFileSync('app/out/renderer/assets/useWorkflowRunner-DGw6Ekx4.js', 'utf8');

let idx = 0;
while ((idx = curCode.indexOf('elevenlabs', idx)) !== -1) {
  const snippet = curCode.slice(Math.max(0, idx - 150), idx + 250);
  if (snippet.includes('r.type') || snippet.includes('providerId') || snippet.includes('TTS') || snippet.includes('prompt')) {
    console.log('--- At', idx, '---');
    console.log(snippet);
  }
  idx += 12;
}
