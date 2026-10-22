const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const targets = [
  path.join(__dirname, '../app/out/renderer/assets/index-8u8DZic4.js'),
  path.join(__dirname, '../extracted_original/out/renderer/assets/index-8u8DZic4.js'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Customer_Edition/resources/app/out/renderer/assets/index-8u8DZic4.js')
];

for (const target of targets) {
  if (!fs.existsSync(target)) continue;
  console.log('[*] Patching EXACT Google Flow credit matrix in:', target);
  let code = fs.readFileSync(target, 'utf8');

  // Replace pE table with official Google Flow Omni Flash credit values:
  // 4s: 15, 6s: 20, 8s: 25, 10s: 30
  code = code.replace(
    /pE=\{"4s":\d+,"6s":\d+,"8s":\d+,"10s":\d+\}/g,
    'pE={"4s":15,"6s":20,"8s":25,"10s":30}'
  );

  // Replace vE function with robust credit lookup
  code = code.replace(
    /function vE\(a,l\)\{return a==="Veo 3\.1 - Priority"\?0:a==="Omni Flash"\?pE\[l\]:a==="Veo 3\.1 - Lite"\?10:a==="Veo 3\.1 - Quality"\?100:20\}/g,
    'function vE(a,l){return a==="Veo 3.1 - Priority"?0:a==="Omni Flash"?(pE[l]||25):a==="Veo 3.1 - Lite"?10:a==="Veo 3.1 - Quality"?100:20}'
  );

  fs.writeFileSync(target, code, 'utf8');
}

console.log('[*] Validating syntax of patched bundles...');
for (const target of targets) {
  if (!fs.existsSync(target)) continue;
  try {
    execSync(`node --check "${target}"`, { stdio: 'inherit' });
    console.log('[PASS] Syntax valid for:', target);
  } catch (err) {
    console.error('[FAIL] Syntax error in:', target);
    process.exit(1);
  }
}

console.log('\n🌟 EXACT GOOGLE FLOW CREDIT PRICING 100% PATCHED! 🌟');
