const fs = require('fs');

const content = fs.readFileSync('extracted_original_20260912/out/renderer/assets/index-BS7vgKVV.js', 'utf8');
let pos = 0;
while ((pos = content.indexOf('capabilityLockedCurrentPlan', pos)) !== -1) {
  console.log('=== capabilityLockedCurrentPlan at', pos, '===');
  console.log(content.slice(Math.max(0, pos - 500), Math.min(content.length, pos + 500)));
  pos += 25;
}
