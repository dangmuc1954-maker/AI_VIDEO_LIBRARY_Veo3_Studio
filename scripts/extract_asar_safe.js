const fs = require('fs');
const path = require('path');

// asar format: 4 bytes size, JSON header, then file data
const fd = fs.openSync('C:/Users/admin/AppData/Local/Programs/aiforge-studio/resources/app.asar', 'r');
const headerSizeBuf = Buffer.alloc(16);
fs.readSync(fd, headerSizeBuf, 0, 16, 0);

const jsonSize = headerSizeBuf.readUInt32LE(12);
console.log('JSON header size:', jsonSize);
const jsonBuf = Buffer.alloc(jsonSize);
fs.readSync(fd, jsonBuf, 0, jsonSize, 16);
const header = JSON.parse(jsonBuf.toString('utf8'));

const baseOffset = 16 + jsonSize;
console.log('Base offset:', baseOffset);

const outDir = path.resolve('extracted_aiforge_studio_new');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

function extractDir(node, curPath) {
  if (!fs.existsSync(curPath)) fs.mkdirSync(curPath, { recursive: true });
  for (const [name, info] of Object.entries(node.files || {})) {
    const target = path.join(curPath, name);
    if (info.files) {
      extractDir(info, target);
    } else if (info.unpacked) {
      // file is in app.asar.unpacked
      const unpackedSrc = path.join('C:/Users/admin/AppData/Local/Programs/aiforge-studio/resources/app.asar.unpacked', path.relative(outDir, target));
      if (fs.existsSync(unpackedSrc)) {
        try { fs.copyFileSync(unpackedSrc, target); } catch(e) {}
      }
    } else {
      // file in asar
      const buf = Buffer.alloc(info.size);
      fs.readSync(fd, buf, 0, info.size, baseOffset + parseInt(info.offset, 10));
      fs.writeFileSync(target, buf);
    }
  }
}

extractDir(header, outDir);
fs.closeSync(fd);
console.log('Successfully extracted asar to', outDir);
