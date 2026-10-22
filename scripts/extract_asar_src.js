const fs = require('fs');
const path = require('path');

const asarPath = "C:\\Users\\admin\\AppData\\Local\\Programs\\aiforge-studio\\resources\\app.asar";
const outDir = path.join(__dirname, '..', 'extracted_aiforge_studio');

const fd = fs.openSync(asarPath, 'r');

// Read 16-byte header
const headerBuf = Buffer.alloc(16);
fs.readSync(fd, headerBuf, 0, 16, 0);

const jsonSize = headerBuf.readUInt32LE(12);
console.log('jsonSize:', jsonSize);

const jsonBuf = Buffer.alloc(jsonSize);
fs.readSync(fd, jsonBuf, 0, jsonSize, 16);

const header = JSON.parse(jsonBuf.toString('utf8'));
const baseOffset = 16 + jsonSize;
console.log('baseOffset:', baseOffset);

let extractedCount = 0;
let skippedCount = 0;

function walk(tree, currentPath) {
  for (const [name, info] of Object.entries(tree.files || {})) {
    const fullRelPath = currentPath ? `${currentPath}/${name}` : name;
    
    // Skip node_modules to be fast and avoid missing unpacked dependencies
    if (fullRelPath.startsWith('node_modules')) {
      skippedCount++;
      continue;
    }

    if (info.files) {
      // Directory
      walk(info, fullRelPath);
    } else if (info.offset !== undefined) {
      // Regular file inside asar
      const targetFilePath = path.join(outDir, fullRelPath.replace(/\//g, path.sep));
      fs.mkdirSync(path.dirname(targetFilePath), { recursive: true });
      
      const fileBuf = Buffer.alloc(info.size);
      const fileOffset = baseOffset + parseInt(info.offset, 10);
      fs.readSync(fd, fileBuf, 0, info.size, fileOffset);
      fs.writeFileSync(targetFilePath, fileBuf);
      extractedCount++;
    }
  }
}

fs.mkdirSync(outDir, { recursive: true });
walk(header, '');
fs.closeSync(fd);

console.log(`Extracted ${extractedCount} files, skipped ${skippedCount} node_modules entries.`);
