const fs = require('fs');

const asarPath = 'C:\\Users\\admin\\AppData\\Local\\Programs\\aiforge-studio\\resources\\app.asar';
const fd = fs.openSync(asarPath, 'r');

// Read the asar header
// asar header format:
// 4 bytes: uint32 = 4
// 4 bytes: uint32 = header size + 4
// 4 bytes: uint32 = header size
// 4 bytes: uint32 = header json string length
// JSON string: header
const headerBuf = Buffer.alloc(16);
fs.readSync(fd, headerBuf, 0, 16, 0);
const jsonLen = headerBuf.readUInt32LE(12);
console.log('jsonLen:', jsonLen);

const jsonBuf = Buffer.alloc(jsonLen);
fs.readSync(fd, jsonBuf, 0, jsonLen, 16);
const header = JSON.parse(jsonBuf.toString('utf-8'));
fs.closeSync(fd);

// Traverse header to list all files
function listFiles(obj, curPath = '') {
  let files = [];
  if (obj.files) {
    for (const [name, val] of Object.entries(obj.files)) {
      const p = curPath ? `${curPath}/${name}` : name;
      if (val.files) {
        files = files.concat(listFiles(val, p));
      } else {
        files.push({ path: p, size: val.size, offset: val.offset });
      }
    }
  }
  return files;
}

const files = listFiles(header);
console.log(`Total files in asar: ${files.length}`);
console.log('Sample files:');
console.log(files.slice(0, 20));

// Find JS/HTML files or workflow files
const workflowFiles = files.filter(f => f.path.toLowerCase().includes('workflow') || f.path.toLowerCase().includes('store'));
console.log('Workflow-related files in asar:', workflowFiles);

// Find main/renderer files
const jsFiles = files.filter(f => f.path.endsWith('.js') || f.path.endsWith('.html') || f.path.endsWith('.json'));
console.log('JS/HTML/JSON files count:', jsFiles.length);
jsFiles.forEach(f => {
  if (f.size > 100000 || f.path.includes('renderer') || f.path.includes('index') || f.path.includes('dist')) {
    console.log(`  ${f.path} (${f.size} bytes, offset: ${f.offset})`);
  }
});
