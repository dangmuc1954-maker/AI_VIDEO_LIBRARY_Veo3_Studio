const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/WorkflowEditor-LHGC9K3C.js', 'utf8');

console.log('=== All occurrences of video-dubbing ===');
let p = 0;
while ((p = content.indexOf('video-dubbing', p)) !== -1) {
  console.log('Pos:', p);
  console.log(content.slice(Math.max(0, p - 80), p + 180));
  p += 1;
}

console.log('=== All occurrences of video-script-extract ===');
p = 0;
while ((p = content.indexOf('video-script-extract', p)) !== -1) {
  console.log('Pos:', p);
  console.log(content.slice(Math.max(0, p - 80), p + 180));
  p += 1;
}
