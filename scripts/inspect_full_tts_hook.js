const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

const ttsStart = content.indexOf('if(n.payload?.tts?.enabled && c.assets?.length>0)');
console.log('=== TTS HOOK IN MAIN ===');
console.log(content.substring(ttsStart, ttsStart + 3500));
