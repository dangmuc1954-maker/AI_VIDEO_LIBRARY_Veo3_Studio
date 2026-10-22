const fs = require('fs');

const content = fs.readFileSync('extracted_original_20260912/out/renderer/assets/index-BS7vgKVV.js', 'utf8');

['autoUpscaleSwitchLabel', 'autoUpscaleLabel'].forEach(key => {
  let pos = 0;
  while ((pos = content.indexOf(key, pos)) !== -1) {
    if (pos > 550000) { // beyond the i18n dictionaries
      console.log(`=== ${key} code at pos ${pos} ===`);
      console.log(content.slice(Math.max(0, pos - 400), Math.min(content.length, pos + 800)));
    }
    pos += key.length;
  }
});
