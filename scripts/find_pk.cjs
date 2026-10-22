const fs = require('fs');
const path = require('path');

const exe = path.resolve(__dirname, '../scratch/zip3_analysis/AI_VIDEO_LIBRARY_Setup_v3.0.exe');
const buf = fs.readFileSync(exe);
console.log('Total file size:', buf.length);

const zipMagic = Buffer.from([0x50, 0x4B, 0x03, 0x04]);
let pos = 0;
let offsets = [];
while ((pos = buf.indexOf(zipMagic, pos)) !== -1) {
  offsets.push(pos);
  pos += 4;
}
console.log('Found PK entries count:', offsets.length);
console.log('First 5 PK offsets:', offsets.slice(0, 5));
if (offsets.length > 0) {
  // Let's see if 7zip or node can extract from an offset or directly
  console.log('Earliest PK offset:', offsets[0]);
}
