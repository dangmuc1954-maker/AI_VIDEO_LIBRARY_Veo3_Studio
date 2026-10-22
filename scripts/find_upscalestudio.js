const fs = require('fs');

const content = fs.readFileSync('extracted_original_20260912/out/renderer/assets/index-BS7vgKVV.js', 'utf8');
let pos = 0;
while ((pos = content.indexOf('upscaleStudio', pos)) !== -1) {
  console.log('=== upscaleStudio at', pos, '===');
  console.log(content.slice(Math.max(0, pos - 400), Math.min(content.length, pos + 400)));
  pos += 13;
}
