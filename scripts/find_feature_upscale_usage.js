const fs = require('fs');

function findUsage(file) {
  const content = fs.readFileSync(file, 'utf8');
  ['featureUpscaleImage', 'featureUpscaleVideo', 'featureRemoveWatermarkImage', 'featureRemoveWatermarkVideo'].forEach(key => {
    let pos = 0;
    while ((pos = content.indexOf(key, pos)) !== -1) {
      console.log(`=== ${file} : ${key} at ${pos} ===`);
      console.log(content.slice(Math.max(0, pos - 200), Math.min(content.length, pos + 400)));
      pos += key.length;
    }
  });
}

console.log('--- Searching in extracted_original_20260912 ---');
findUsage('extracted_original_20260912/out/renderer/assets/index-BS7vgKVV.js');

console.log('--- Searching in main/index.js ---');
findUsage('extracted_original_20260912/out/main/index.js');
