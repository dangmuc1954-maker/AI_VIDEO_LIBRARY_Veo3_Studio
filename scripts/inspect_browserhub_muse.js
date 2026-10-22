const fs = require('fs');

function inspectFile(filePath) {
  console.log('=== Inspecting:', filePath, '===');
  const content = fs.readFileSync(filePath, 'utf8');

  // Find all occurrences of 'muse' (case-insensitive)
  const regex = /.{0,80}muse.{0,80}/gi;
  let match;
  let count = 0;
  while ((match = regex.exec(content)) !== null) {
    console.log(`[${count++}]`, match[0].trim());
    if (count > 25) break;
  }
}

inspectFile('app/out/renderer/assets/BrowserHub-44JPDUjK.js');
inspectFile('app/out/renderer/assets/index-BS7vgKVV.js');
