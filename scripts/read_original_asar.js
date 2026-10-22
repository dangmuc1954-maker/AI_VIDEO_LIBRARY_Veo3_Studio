const fs = require('fs');

const asarPath = 'C:/Users/admin/AppData/Local/Programs/aiforge-studio/resources/app.asar';
const fd = fs.openSync(asarPath, 'r');

const sizeBuf = Buffer.alloc(16);
fs.readSync(fd, sizeBuf, 0, 16, 0);

const headerSize = sizeBuf.readUInt32LE(12);
console.log('Header size:', headerSize);

const headerBuf = Buffer.alloc(headerSize);
fs.readSync(fd, headerBuf, 0, headerSize, 16);

const header = JSON.parse(headerBuf.toString('utf8'));
const baseOffset = 16 + headerSize;

function findFile(dir, targetName, currentPath = '') {
  for (const [name, entry] of Object.entries(dir.files || {})) {
    const fullPath = currentPath ? `${currentPath}/${name}` : name;
    if (fullPath === targetName) {
      return entry;
    }
    if (entry.files) {
      const res = findFile(entry, targetName, fullPath);
      if (res) return res;
    }
  }
  return null;
}

const mainEntry = findFile(header, 'out/main/index.js');
console.log('out/main/index.js entry:', mainEntry);

if (mainEntry) {
  const fileBuf = Buffer.alloc(mainEntry.size);
  fs.readSync(fd, fileBuf, 0, mainEntry.size, baseOffset + Number(mainEntry.offset));
  fs.writeFileSync('temp_original_main.js', fileBuf);
  console.log('Extracted original out/main/index.js successfully! Size:', fileBuf.length);
}
fs.closeSync(fd);
