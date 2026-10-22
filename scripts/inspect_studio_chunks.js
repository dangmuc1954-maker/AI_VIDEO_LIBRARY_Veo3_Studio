const fs = require('fs');

function inspectFile(filePath, keywords) {
  console.log(`\n================= ${filePath} =================`);
  const content = fs.readFileSync(filePath, 'utf8');
  keywords.forEach(k => {
    let pos = 0;
    while ((pos = content.indexOf(k, pos)) !== -1) {
      console.log(`--- Keyword "${k}" at ${pos} ---`);
      console.log(content.slice(Math.max(0, pos - 150), Math.min(content.length, pos + 300)));
      pos += k.length;
    }
  });
}

inspectFile('extracted_original_20260912/out/renderer/assets/licenseCapabilities-HpsCBvbh.js', ['upscale', 'watermark', 'image', 'video', 'VIP', 'Vĩnh', 'plan']);
inspectFile('extracted_original_20260912/out/renderer/assets/ImageStudio-4nmpUX3j.js', ['upscale', 'Full HD', '2K', '4K', 'coin', 'capability', 'quality']);
inspectFile('extracted_original_20260912/out/renderer/assets/VideoStudio-frcr8V6s.js', ['autoUpscale', 'watermark', 'capability', 'coin', 'lock', 'VIP']);
