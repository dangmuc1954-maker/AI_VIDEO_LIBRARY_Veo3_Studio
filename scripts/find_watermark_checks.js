const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

let pos = 0;
while ((pos = content.indexOf('remove_watermark_video', pos)) !== -1) {
  console.log('remove_watermark_video at', pos);
  console.log(content.slice(Math.max(0, pos - 50), pos + 150));
  pos += 22;
}
