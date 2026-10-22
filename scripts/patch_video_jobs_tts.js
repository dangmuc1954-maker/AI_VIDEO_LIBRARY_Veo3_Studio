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
  console.log('[*] Patching job payload creation in:', vsPath);
  let code = fs.readFileSync(vsPath, 'utf8');

  // 1. Grok payload patch
  // Replace old grok payload tts
  const oldGrokTts = /tts:f\.tts\?\.enabled&&f\.tts\?\.script\?\.trim\(\)\?\{enabled:!0,voiceId:f\.tts\.voiceId\|\|"[^"]+",voiceName:f\.tts\.voiceName\|\|"[^"]+",script:f\.tts\.script\.trim\(\),modelId:f\.tts\.modelId\|\|"[^"]+"\}:void 0/g;
  const newGrokTts = `tts:f.tts?.enabled?{enabled:!0,voiceId:(f.tts.voiceId||"").trim()||"aN7cv9yXNrfIR87bDmyD",voiceName:(f.tts.voiceName||"").trim()||"Ninh Đôn – Deep & Warm (Tiếng Việt)",script:(f.tts.script||"").trim(),modelId:(f.tts.modelId||"").trim()||"eleven_multilingual_v2"}:void 0`;
  code = code.replace(oldGrokTts, newGrokTts);

  // Also check if grok already has custom string
  const altGrokTts = /tts:f\.tts\?\.enabled&&\([^)]+\)\?\{enabled:!0,voiceId:[^,]+,voiceName:[^,]+,script:[^,]+,modelId:[^}]+\}:void 0/g;
  code = code.replace(altGrokTts, newGrokTts);

  // 2. Veo3 payload patch
  // In Veo3: sceneName:f.sceneName||`Phân cảnh ${f.index}`,batchIndex:Z
  // We insert tts right after sceneName
  const veoSceneAnchor = 'sceneName:f.sceneName||`Phân cảnh ${f.index}`,';
  if (code.includes(veoSceneAnchor) && !code.includes(veoSceneAnchor + newGrokTts + ',')) {
    code = code.replace(veoSceneAnchor, veoSceneAnchor + newGrokTts + ',');
    console.log('  ✓ Added tts payload to Veo3 job creation!');
  } else {
    console.log('  Notice: Veo3 anchor check:', code.includes(veoSceneAnchor));
  }

  fs.writeFileSync(vsPath, code, 'utf8');

  // Check syntax
  fs.writeFileSync('temp_job_check.mjs', code);
  try {
    execSync('node --check temp_job_check.mjs', { stdio: 'inherit' });
    console.log('  ✅ VideoStudio syntax valid:', vsPath);
  } catch (err) {
    console.error('  ❌ VideoStudio syntax error:', err.message);
    process.exit(1);
  } finally {
    try { fs.unlinkSync('temp_job_check.mjs'); } catch (_) {}
  }
}
