const fs = require('fs');
const path = require('path');

const targetRoots = [
  path.join(__dirname, '../app'),
  path.join(__dirname, '../extracted_original'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Customer_Edition/resources/app')
];

const targetStr = 'duration:f.duration,model:f.model,creditCost:';
const replacementStr = 'duration:f.duration,model:f.model,tts:f.tts?.enabled&&f.tts?.script?.trim()?{enabled:!0,voiceId:f.tts.voiceId||"aN7cv9yXNrfIR87bDmyD",voiceName:f.tts.voiceName||"Ninh Đôn – Deep & Warm",script:f.tts.script.trim(),modelId:f.tts.modelId||"eleven_multilingual_v2"}:void 0,creditCost:';

for (const root of targetRoots) {
  const vsPath = path.join(root, 'out/renderer/assets/VideoStudio-BZY_1pM8.js');
  if (!fs.existsSync(vsPath)) continue;
  let code = fs.readFileSync(vsPath, 'utf8');
  if (code.includes(targetStr) && !code.includes('duration:f.duration,model:f.model,tts:f.tts?.enabled')) {
    code = code.replace(targetStr, replacementStr);
    fs.writeFileSync(vsPath, code, 'utf8');
    console.log('[+] Đã tích hợp tts payload cho Veo 3 tại:', vsPath);
  } else {
    console.log('[-] Đã có sẵn hoặc không tìm thấy tại:', vsPath);
  }
}
