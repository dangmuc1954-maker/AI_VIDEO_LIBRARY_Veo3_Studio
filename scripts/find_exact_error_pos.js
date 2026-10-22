const fs = require('fs');
const vm = require('vm');
const path = require('path');

const origPath = path.join(__dirname, '../extracted_original/out/renderer/assets/VideoStudio-BZY_1pM8.js');
let code = fs.readFileSync(origPath, 'utf8');

// 1. Let's see if origCode itself is valid!
try {
  new vm.SourceTextModule(code, { initializeImportMeta() {} });
  console.log('Original code IS VALID!');
} catch (err) {
  console.error('Original code is ALREADY INVALID:', err.message);
}
