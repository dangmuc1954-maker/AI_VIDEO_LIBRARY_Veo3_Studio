const fs = require('fs');

function searchMain(file) {
  console.log(`\n================ Searching ${file} ================`);
  const content = fs.readFileSync(file, 'utf8');
  const terms = [
    'upscale_image',
    'upscale_video',
    'remove_watermark_image',
    'remove_watermark_video',
    'autoUpscale',
    'upsampleResolution',
    'autoRemoveWatermark',
    'removeWatermark',
    'upscaleTargetResolution'
  ];
  terms.forEach(t => {
    let pos = 0;
    let count = 0;
    while ((pos = content.indexOf(t, pos)) !== -1) {
      count++;
      console.log(`--- Term "${t}" at pos ${pos} ---`);
      console.log(content.slice(Math.max(0, pos - 150), Math.min(content.length, pos + 300)));
      pos += t.length;
    }
    if (count === 0) console.log(`Term "${t}": NOT FOUND`);
  });
}

searchMain('extracted_original_20260912/out/main/index.js');
searchMain('app/out/main/index.js');
