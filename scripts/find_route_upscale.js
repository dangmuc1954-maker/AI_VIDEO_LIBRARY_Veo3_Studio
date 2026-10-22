const fs = require('fs');

const content = fs.readFileSync('extracted_original_20260912/out/renderer/assets/index-BS7vgKVV.js', 'utf8');
let pos = 0;
while ((pos = content.indexOf('/studio/upscale', pos)) !== -1) {
  console.log('=== /studio/upscale at', pos, '===');
  console.log(content.slice(Math.max(0, pos - 300), Math.min(content.length, pos + 300)));
  pos += 15;
}
