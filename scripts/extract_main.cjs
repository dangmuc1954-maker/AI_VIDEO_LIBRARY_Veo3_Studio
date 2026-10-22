const fs = require('fs');
const path = require('path');

const asarPath = 'C:\\Users\\admin\\AppData\\Local\\Programs\\aiforge-studio\\resources\\app.asar';
const fd = fs.openSync(asarPath, 'r');

const headerBuf = Buffer.alloc(16);
fs.readSync(fd, headerBuf, 0, 16, 0);
const jsonLen = headerBuf.readUInt32LE(12);

const jsonBuf = Buffer.alloc(jsonLen);
fs.readSync(fd, jsonBuf, 0, jsonLen, 16);
const header = JSON.parse(jsonBuf.toString('utf-8'));

const baseDataOffset = 16 + jsonLen;

function extractFile(relPath, targetDest) {
  const parts = relPath.split('/');
  let cur = header;
  for (const part of parts) {
    if (!cur.files || !cur.files[part]) {
      throw new Error(`Part ${part} not found in ${relPath}`);
    }
    cur = cur.files[part];
  }
  const offset = baseDataOffset + parseInt(cur.offset, 10);
  const size = cur.size;
  console.log(`Extracting ${relPath}: size=${size}, offset=${offset}`);
  const buf = Buffer.alloc(size);
  fs.readSync(fd, buf, 0, size, offset);
  fs.writeFileSync(targetDest, buf);
  console.log(`Wrote to ${targetDest}`);
}

const outDir = path.join(__dirname, 'extracted');
extractFile('out/main/index.js', path.join(outDir, 'main_index.js'));
extractFile('out/preload/index.js', path.join(outDir, 'preload_index.js'));

fs.closeSync(fd);
