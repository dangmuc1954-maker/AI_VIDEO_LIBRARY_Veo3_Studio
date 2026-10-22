const fs = require('fs');
const file = 'app/out/renderer/assets/index-BS7vgKVV.js';
let content = fs.readFileSync(file, 'utf8');

const targetVd = 'a==="muse-video"?String(n||"5s")';
const replaceVd = 'a==="muse-video"?String(n||"10s")';

if (content.includes(targetVd)) {
  content = content.replace(targetVd, replaceVd);
  fs.writeFileSync(file, content, 'utf8');
  console.log('✓ Updated Vd default duration to 10s in index-BS7vgKVV.js');
} else {
  console.log('targetVd already updated or not found');
}
