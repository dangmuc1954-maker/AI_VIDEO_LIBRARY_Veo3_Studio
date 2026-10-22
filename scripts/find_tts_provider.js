const fs = require('fs');
const content = fs.readFileSync('d:/dự án antigravity/AIForge_Veo3_Studio/app/out/renderer/assets/TTSStudio-C_2cGcBA.js', 'utf8');

let idx = 0;
while ((idx = content.indexOf('providerId', idx)) !== -1) {
  console.log('--- FOUND at', idx, '---');
  console.log(content.slice(Math.max(0, idx - 100), Math.min(content.length, idx + 200)));
  idx += 10;
}
