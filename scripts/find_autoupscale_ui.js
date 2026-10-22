const fs = require('fs');

const content = fs.readFileSync('extracted_original_20260912/out/renderer/assets/index-BS7vgKVV.js', 'utf8');

['autoUpscaleLabel', 'autoUpscaleSwitchLabel', 'autoRemoveWatermarkLabel', 'autoRemoveWatermarkSwitchLabel'].forEach(k => {
  let idx = 0;
  while ((idx = content.indexOf(k, idx)) !== -1) {
    console.log(`=== ${k} at ${idx} ===`);
    console.log(content.slice(Math.max(0, idx - 200), Math.min(content.length, idx + 400)));
    idx += k.length;
  }
});
