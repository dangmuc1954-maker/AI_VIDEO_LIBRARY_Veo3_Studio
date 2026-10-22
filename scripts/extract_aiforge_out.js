const fs = require('fs');
const path = require('path');

const asarPath = 'C:/Users/admin/AppData/Local/Programs/aiforge-studio/resources/app.asar';
const destDir = 'C:/Users/admin/.gemini/antigravity-ide/brain/989bde5b-7b0e-4357-b6e0-e795ccef2b41/scratch/aiforge_out';

const fd = fs.openSync(asarPath, 'r');
const buf = Buffer.alloc(16);
fs.readSync(fd, buf, 0, 16, 0);
const jsonSize = buf.readUInt32LE(12);
const jsonBuf = Buffer.alloc(jsonSize);
fs.readSync(fd, jsonBuf, 0, jsonSize, 16);
const header = JSON.parse(jsonBuf.toString('utf-8'));

// The base offset for file content is 16 + jsonSize (aligned or exact? In asar it's 16 + jsonSize)
const baseOffset = 16 + jsonSize;

function extractNode(node, currentPath) {
  if (node.files) {
    // Directory
    const fullDir = path.join(destDir, currentPath);
    if (!fs.existsSync(fullDir)) {
      fs.mkdirSync(fullDir, { recursive: true });
    }
    for (const childName of Object.keys(node.files)) {
      extractNode(node.files[childName], path.join(currentPath, childName));
    }
  } else if (node.size !== undefined && node.offset !== undefined) {
    // File inside asar
    const fullFilePath = path.join(destDir, currentPath);
    const fileOffset = baseOffset + parseInt(node.offset, 10);
    const fileBuf = Buffer.alloc(node.size);
    fs.readSync(fd, fileBuf, 0, node.size, fileOffset);
    const dir = path.dirname(fullFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(fullFilePath, fileBuf);
    console.log('Extracted:', currentPath, '(' + node.size + ' bytes)');
  }
}

console.log('Extracting "out" directory...');
if (header.files.out) {
  extractNode(header.files.out, 'out');
}
if (header.files['package.json']) {
  extractNode(header.files['package.json'], 'package.json');
}

fs.closeSync(fd);
console.log('Finished extracting!');
