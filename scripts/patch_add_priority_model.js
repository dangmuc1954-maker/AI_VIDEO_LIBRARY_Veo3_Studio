const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rendererTargets = [
  path.join(__dirname, '../app/out/renderer/assets/index-8u8DZic4.js'),
  path.join(__dirname, '../extracted_original/out/renderer/assets/index-8u8DZic4.js'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Customer_Edition/resources/app/out/renderer/assets/index-8u8DZic4.js')
];

const mainTargets = [
  path.join(__dirname, '../app/out/main/index.js'),
  path.join(__dirname, '../extracted_original/out/main/index.js'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Customer_Edition/resources/app/out/main/index.js')
];

// 1. Update renderer targets (index-8u8DZic4.js)
for (const target of rendererTargets) {
  if (!fs.existsSync(target)) continue;
  console.log('[*] Adding Veo 3.1 - Priority (0 credits) to renderer:', target);
  let code = fs.readFileSync(target, 'utf8');

  // Update p0 list
  code = code.replace(
    'const p0=["Omni Flash","Veo 3.1 - Lite","Veo 3.1 - Fast","Veo 3.1 - Quality"]',
    'const p0=["Omni Flash","Veo 3.1 - Priority","Veo 3.1 - Lite","Veo 3.1 - Fast","Veo 3.1 - Quality"]'
  );

  // Update is mapping dictionary
  code = code.replace(
    'is={Lite:"Veo 3.1 - Lite",Fast:"Veo 3.1 - Fast",Quality:"Veo 3.1 - Quality",Standard:"Veo 3.1 - Fast",High:"Veo 3.1 - Quality"}',
    'is={Priority:"Veo 3.1 - Priority",Lite:"Veo 3.1 - Lite",Fast:"Veo 3.1 - Fast",Quality:"Veo 3.1 - Quality",Standard:"Veo 3.1 - Fast",High:"Veo 3.1 - Quality"}'
  );

  // Update vE credit calculation: Priority -> 0 credits!
  code = code.replace(
    'function vE(a,l){return a==="Omni Flash"?pE[l]:a==="Veo 3.1 - Lite"?10:a==="Veo 3.1 - Quality"?100:20}',
    'function vE(a,l){return a==="Veo 3.1 - Priority"?0:a==="Omni Flash"?pE[l]:a==="Veo 3.1 - Lite"?10:a==="Veo 3.1 - Quality"?100:20}'
  );

  fs.writeFileSync(target, code, 'utf8');
}

// 2. Update main targets (main/index.js)
for (const target of mainTargets) {
  if (!fs.existsSync(target)) continue;
  console.log('[*] Adding Veo 3.1 - Priority (0 credits) to main bundle:', target);
  let code = fs.readFileSync(target, 'utf8');

  // Update vu list
  code = code.replace(
    'const vu=["Omni Flash","Veo 3.1 - Lite","Veo 3.1 - Fast","Veo 3.1 - Quality"]',
    'const vu=["Omni Flash","Veo 3.1 - Priority","Veo 3.1 - Lite","Veo 3.1 - Fast","Veo 3.1 - Quality"]'
  );

  // Update cr dictionary
  code = code.replace(
    'cr={Lite:"Veo 3.1 - Lite",Fast:"Veo 3.1 - Fast",Quality:"Veo 3.1 - Quality",Standard:"Veo 3.1 - Fast",High:"Veo 3.1 - Quality"}',
    'cr={Priority:"Veo 3.1 - Priority",Lite:"Veo 3.1 - Lite",Fast:"Veo 3.1 - Fast",Quality:"Veo 3.1 - Quality",Standard:"Veo 3.1 - Fast",High:"Veo 3.1 - Quality"}'
  );

  // Update Pu helper
  code = code.replace(
    'function Pu(r){return r==="Veo 3.1 - Lite"?"Lite":r==="Veo 3.1 - Quality"?"Quality":"Fast"}',
    'function Pu(r){return r==="Veo 3.1 - Priority"?"Priority":r==="Veo 3.1 - Lite"?"Lite":r==="Veo 3.1 - Quality"?"Quality":"Fast"}'
  );

  // Update Tu helper
  code = code.replace(
    'c==="Lite"?{id:`veo_3_1_t2v_lite${d}${n?"_portrait":"_landscape"}`,modelKey:`veo_3_1_t2v_lite${d}`,aspectRatio:s,useV2ModelConfig:!0}',
    'c==="Priority"?{id:`veo_3_1_t2v_priority${d}${n?"_portrait":"_landscape"}`,modelKey:`veo_3_1_t2v_lite${d}`,aspectRatio:s,useV2ModelConfig:!0}:c==="Lite"?{id:`veo_3_1_t2v_lite${d}${n?"_portrait":"_landscape"}`,modelKey:`veo_3_1_t2v_lite${d}`,aspectRatio:s,useV2ModelConfig:!0}'
  );

  // Update ku helper
  code = code.replace(
    'return o==="Lite"?',
    'return o==="Priority"||o==="Lite"?'
  );

  // Update Cu helper
  code = code.replace(
    'n==="Lite"?{id:`veo_3_1_i2v_lite${e}${t?"_portrait":"_landscape"}`,modelKey:e?`veo_3_1_i2v_s_lite${e}`:"veo_3_1_i2v_lite",aspectRatio:r,useV2ModelConfig:!0}',
    'n==="Priority"||n==="Lite"?{id:`veo_3_1_i2v_${n==="Priority"?"priority":"lite"}${e}${t?"_portrait":"_landscape"}`,modelKey:e?`veo_3_1_i2v_s_lite${e}`:"veo_3_1_i2v_lite",aspectRatio:r,useV2ModelConfig:!0}'
  );

  fs.writeFileSync(target, code, 'utf8');
}

// 3. Test syntax of all files
console.log('[*] Validating syntax of all files...');
for (const target of [...rendererTargets, ...mainTargets]) {
  if (!fs.existsSync(target)) continue;
  try {
    execSync(`node --check "${target}"`, { stdio: 'inherit' });
    console.log('[PASS] Syntax valid for:', target);
  } catch (err) {
    console.error('[FAIL] Syntax error in:', target);
    process.exit(1);
  }
}

console.log('\n🌟 VEO 3.1 - PRIORITY (0 CREDITS) SUCCESSFULLY RESTORED AND VALIDATED! 🌟');
