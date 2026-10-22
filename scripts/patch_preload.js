const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../app/out/preload/index.cjs');
let s = fs.readFileSync(file, 'utf8');
if (!s.includes('syncVoiceoverVideo')) {
  s = s.replace(
    'muxAudioVideo:(e,n,s)=>r.ipcRenderer.invoke("assets:muxAudioVideo",e,n,s),',
    'muxAudioVideo:(e,n,s)=>r.ipcRenderer.invoke("assets:muxAudioVideo",e,n,s),syncVoiceoverVideo:(e,n,s)=>r.ipcRenderer.invoke("assets:syncVoiceoverVideo",e,n,s),'
  );
  fs.writeFileSync(file, s, 'utf8');
  console.log('✓ Patched preload with syncVoiceoverVideo!');
} else {
  console.log('Already patched.');
}
