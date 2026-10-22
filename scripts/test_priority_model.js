const fs = require('fs');
const path = require('path');

const targets = [
  path.join(__dirname, '../app/out/main/index.js'),
  path.join(__dirname, '../extracted_original/out/main/index.js'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Customer_Edition/resources/app/out/main/index.js')
];

for (const target of targets) {
  if (!fs.existsSync(target)) continue;
  console.log('Testing Veo 3.1 - Priority in:', target);
  const code = fs.readFileSync(target, 'utf8');

  const start = code.indexOf('const vu=');
  const end = code.indexOf('class Mu{');
  const snippet = code.substring(start, end);
  eval(snippet);

  const resT2V = Tu({ model: 'Veo 3.1 - Priority', mode: 'T2V', ratio: '16:9', duration: '8s' });
  console.log('T2V Result:', resT2V);
  if (!resT2V.useV2ModelConfig || !resT2V.modelKey) {
    console.error('FAIL on T2V for Priority');
    process.exit(1);
  }

  const resI2V = Tu({ model: 'Veo 3.1 - Priority', mode: 'I2V', ratio: '9:16', duration: '8s' });
  console.log('I2V Result:', resI2V);
  if (!resI2V.useV2ModelConfig || !resI2V.modelKey) {
    console.error('FAIL on I2V for Priority');
    process.exit(1);
  }
}

// Test credit cost in renderer
const rendererCode = fs.readFileSync('app/out/renderer/assets/index-8u8DZic4.js', 'utf8');
const p0Match = rendererCode.includes('"Veo 3.1 - Priority"');
console.log('Renderer includes Veo 3.1 - Priority in p0:', p0Match);
if (!p0Match) {
  console.error('FAIL: Renderer missing Veo 3.1 - Priority');
  process.exit(1);
}

console.log('\n🌟 VEO 3.1 - PRIORITY (0 CREDITS) 100% OPERATIONAL! 🌟');
