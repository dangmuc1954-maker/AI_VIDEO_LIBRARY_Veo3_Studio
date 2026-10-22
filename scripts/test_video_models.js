const fs = require('fs');
const path = require('path');

const targets = [
  path.join(__dirname, '../app/out/main/index.js'),
  path.join(__dirname, '../extracted_original/out/main/index.js'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Customer_Edition/resources/app/out/main/index.js')
];

let globalSuccess = true;

for (const target of targets) {
  if (!fs.existsSync(target)) continue;
  console.log('Testing bundle:', target);
  const code = fs.readFileSync(target, 'utf8');
  
  const start = code.indexOf('const vu=');
  const end = code.indexOf('class Mu{');
  if (start === -1 || end === -1) {
    console.error('FAILED: Could not find model mapping block in', target);
    globalSuccess = false;
    continue;
  }
  
  const snippet = code.substring(start, end);
  eval(snippet);
  
  const models = ['Omni Flash', 'Veo 3.1 - Lite', 'Veo 3.1 - Fast', 'Veo 3.1 - Quality'];
  const modes = ['T2V', 'I2V', 'Frames', 'R2V', 'Components'];
  const ratios = ['16:9', '9:16'];
  const durations = ['4s', '6s', '8s', '10s'];
  
  let targetOk = true;
  for (const model of models) {
    for (const mode of modes) {
      for (const ratio of ratios) {
        for (const duration of durations) {
          const res = Tu({ model, mode, ratio, duration });
          if (!res || !res.useV2ModelConfig) {
            console.error(`[FAIL] ${model} | ${mode} | ${ratio} | ${duration} -> missing useV2ModelConfig:`, res);
            targetOk = false;
          }
          if (!res.modelKey) {
            console.error(`[FAIL] ${model} | ${mode} | ${ratio} | ${duration} -> missing modelKey:`, res);
            targetOk = false;
          }
          if (res.modelKey.includes('ultra')) {
            console.error(`[FAIL] ${model} | ${mode} | ${ratio} | ${duration} -> has invalid ultra suffix:`, res.modelKey);
            targetOk = false;
          }
        }
      }
    }
  }
  if (targetOk) {
    console.log(`[PASS] 100% of video generation permutations (160 tests) verified for: ${target}`);
  } else {
    globalSuccess = false;
  }
}

if (globalSuccess) {
  console.log('\n🌟 ALL MAIN BUNDLES PASSED VIDEO MODEL VERIFICATION! 🌟');
} else {
  process.exit(1);
}
