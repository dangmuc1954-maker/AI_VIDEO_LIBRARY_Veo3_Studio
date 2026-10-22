const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 1. Source file to restore from if needed, or patch directly
const targets = [
  path.join(__dirname, '../app/out/renderer/assets/VideoStudio-BZY_1pM8.js'),
  path.join(__dirname, '../extracted_original/out/renderer/assets/VideoStudio-BZY_1pM8.js'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Customer_Edition/resources/app/out/renderer/assets/VideoStudio-BZY_1pM8.js')
];

for (const target of targets) {
  if (!fs.existsSync(target)) continue;
  console.log('[*] Applying clean fix for VideoStudio in:', target);
  let code = fs.readFileSync(target, 'utf8');

  // Fix the comma expression syntax error with const:
  code = code.replace(
    /r\.href=W\.videoUrl,const\s+sn=[\s\S]*?r\.download=`Phan_Canh_\$\{sn\}_\$\{st\}\.mp4`,document\.body\.appendChild\(r\)/g,
    'r.href=W.videoUrl,r.download=((()=>{const sn=W.sceneIndex||W.promptOrder||1,st=(W.sceneName||("Phan_Canh_"+sn)).replace(/[^a-zA-Z0-9_\\u00C0-\\u024F\\u1EA0-\\u1EF9]/g,"_").replace(/_+/g,"_").slice(0,40);return"Phan_Canh_"+sn+"_"+st+".mp4"})()),document.body.appendChild(r)'
  );

  // In case original r.download was present:
  code = code.replace(
    'r.download=`video-${W.promptOrder||W.promptId}.mp4`',
    'r.download=((()=>{const sn=W.sceneIndex||W.promptOrder||1,st=(W.sceneName||("Phan_Canh_"+sn)).replace(/[^a-zA-Z0-9_\\u00C0-\\u024F\\u1EA0-\\u1EF9]/g,"_").replace(/_+/g,"_").slice(0,40);return"Phan_Canh_"+sn+"_"+st+".mp4"})())'
  );

  fs.writeFileSync(target, code, 'utf8');
}

console.log('[*] Testing syntax of all bundles...');
for (const target of targets) {
  if (!fs.existsSync(target)) continue;
  try {
    execSync(`node --check "${target}"`, { stdio: 'inherit' });
    console.log('[PASS] Syntax 100% VALID for:', target);
  } catch (err) {
    console.error('[FAIL] Syntax error in:', target);
    process.exit(1);
  }
}
console.log('🌟 ALL BUNDLES SYNTAX VALIDATED! 🌟');
