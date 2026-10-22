const fs = require('fs');
const path = require('path');

const exePath = path.resolve('scratch/zip3_extracted/AI_VIDEO_LIBRARY_Setup_v3.0.exe');
console.log('Reading exe:', exePath);
const buf = fs.readFileSync(exePath);
console.log('Exe size:', buf.length);

// Search for 'PK\x03\x04'
let firstZipOffset = -1;
for (let i = 0; i < buf.length - 4; i++) {
  if (buf[i] === 0x50 && buf[i+1] === 0x4B && buf[i+2] === 0x03 && buf[i+3] === 0x04) {
    firstZipOffset = i;
    break;
  }
}

console.log('First zip offset:', firstZipOffset);
if (firstZipOffset !== -1) {
  // Let's find the end of central directory 'PK\x05\x06'
  let eocdOffset = -1;
  for (let i = buf.length - 22; i >= firstZipOffset; i--) {
    if (buf[i] === 0x50 && buf[i+1] === 0x4B && buf[i+2] === 0x05 && buf[i+3] === 0x06) {
      eocdOffset = i;
      break;
    }
  }
  console.log('EOCD offset:', eocdOffset);
  if (eocdOffset !== -1) {
    const commentLen = buf.readUInt16LE(eocdOffset + 20);
    const zipEnd = eocdOffset + 22 + commentLen;
    console.log('Zip end:', zipEnd, 'Total zip size:', zipEnd - firstZipOffset);
    const zipBuf = buf.subarray(firstZipOffset, zipEnd);
    const outZip = path.resolve('scratch/extracted_payload.zip');
    fs.writeFileSync(outZip, zipBuf);
    console.log('✅ Extracted embedded payload zip to:', outZip, fs.statSync(outZip).size);
  }
}
