const fs = require('fs');

const content = fs.readFileSync('extracted_original_20260912/out/renderer/assets/index-BS7vgKVV.js', 'utf8');
const searchKeys = ['featureUpscaleImage', 'featureUpscaleVideo', 'featureRemoveWatermarkImage', 'featureRemoveWatermarkVideo', 'upscale_image', 'upscale_video', 'upscale-image', 'upscale-video', 'upscale'];

searchKeys.forEach(k => {
  let count = 0;
  let idx = 0;
  while ((idx = content.indexOf(k, idx)) !== -1) {
    count++;
    console.log(`Key ${k} found at ${idx}`);
    console.log(content.slice(Math.max(0, idx - 150), Math.min(content.length, idx + 250)));
    console.log('----------------------------------------------------');
    idx += k.length;
  }
  console.log(`Total for ${k}: ${count}`);
});
