const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const targetRoots = [
  path.join(__dirname, '../app'),
  path.join(__dirname, '../extracted_original'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Customer_Edition/resources/app'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Khach_Hang_v3.0/resources/app')
];

for (const root of targetRoots) {
  const vsPath = path.join(root, 'out/renderer/assets/VideoStudio-BZY_1pM8.js');
  if (!fs.existsSync(vsPath)) continue;
  console.log('[*] Fixing VideoStudio:', vsPath);

  let code = fs.readFileSync(vsPath, 'utf8');

  // Fix Grok payload - clean up any ':void 0' syntax artifacts
  code = code.replace('model:"grok-imagine-video":void 0', 'model:"grok-imagine-video"');
  code = code.replace('sceneName:f.sceneName||`Phân cảnh ${f.index}`:void 0', 'sceneName:f.sceneName||`Phân cảnh ${f.index}`');

  // Verify Veo3 payload has tts
  const ttsStr = `tts:f.tts?.enabled?{enabled:!0,voiceId:(f.tts.voiceId||"").trim()||"aN7cv9yXNrfIR87bDmyD",voiceName:(f.tts.voiceName||"").trim()||"Ninh Đôn – Deep & Warm (Tiếng Việt)",script:(f.tts.script||"").trim(),modelId:(f.tts.modelId||"").trim()||"eleven_multilingual_v2"}:void 0`;
  
  if (!code.includes('referenceAssetIds:ht,' + ttsStr)) {
    code = code.replace('referenceAssetIds:ht', 'referenceAssetIds:ht,' + ttsStr);
  }

  fs.writeFileSync(vsPath, code, 'utf8');

  // Test syntax
  fs.writeFileSync('temp_check_vs.mjs', code);
  try {
    execSync('node --check temp_check_vs.mjs', { stdio: 'inherit' });
    console.log('  ✅ Syntax VALID for VideoStudio:', vsPath);
  } catch (err) {
    console.error('  ❌ Syntax ERROR:', err.message);
    process.exit(1);
  } finally {
    try { fs.unlinkSync('temp_check_vs.mjs'); } catch (_) {}
  }
}

console.log('\n🎉 VideoStudio successfully patched and verified across all targets!');
