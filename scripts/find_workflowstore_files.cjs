const fs = require('fs');

const asarPath = 'C:\\Users\\admin\\AppData\\Local\\Programs\\aiforge-studio\\resources\\app.asar';
const fd = fs.openSync(asarPath, 'r');

const headerBuf = Buffer.alloc(16);
fs.readSync(fd, headerBuf, 0, 16, 0);
const jsonLen = headerBuf.readUInt32LE(12);

const jsonBuf = Buffer.alloc(jsonLen);
fs.readSync(fd, jsonBuf, 0, jsonLen, 16);
const header = JSON.parse(jsonBuf.toString('utf-8'));
const baseDataOffset = 16 + jsonLen;

function listFiles(obj, curPath = '') {
  let files = [];
  if (obj.files) {
    for (const [name, val] of Object.entries(obj.files)) {
      const p = curPath ? `${curPath}/${name}` : name;
      if (val.files) {
        files = files.concat(listFiles(val, p));
      } else {
        files.push({ path: p, size: val.size, offset: parseInt(val.offset, 10) });
      }
    }
  }
  return files;
}

const allFiles = listFiles(header);
console.log('Total files:', allFiles.length);

const term = 'workflowStore';
for (const file of allFiles) {
  if (isNaN(file.offset) || file.size === 0) continue;
  if (file.path.endsWith('.js') || file.path.endsWith('.json') || file.path.endsWith('.html')) {
    const buf = Buffer.alloc(file.size);
    fs.readSync(fd, buf, 0, file.size, baseDataOffset + file.offset);
    const content = buf.toString('utf-8');
    if (content.includes(term)) {
      console.log(`Found "${term}" in ${file.path} (${file.size} bytes)`);
    }
  }
}
fs.closeSync(fd);
