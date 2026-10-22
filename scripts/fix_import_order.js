const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const targetFile = path.resolve('app/out/main/index.js');
let code = fs.readFileSync(targetFile, 'utf8');

// Find the import block
// Look for `import nodeCrypto from "node:crypto";`
const importIdx = code.indexOf('import nodeCrypto from "node:crypto";');
if (importIdx !== -1) {
  // Let's find where the imports end
  // The imports are:
  // import nodeCrypto from "node:crypto";
  // import nodeFs from "node:fs";
  // import nodePath from "node:path";
  // import nodeChild from "node:child_process";
  // import{app as G,...
  
  // The top part before importIdx is dialogue/synthesize functions:
  const topFunctions = code.slice(0, importIdx).trim();
  const restCode = code.slice(importIdx);
  
  // In restCode, let's find where the main imports end, e.g. after `const Ay=import.meta.filename,Nn=import.meta.dirname,Ry=ud.createRequire(import.meta.url);`
  const anchor = 'const Ay=import.meta.filename,Nn=import.meta.dirname,Ry=ud.createRequire(import.meta.url);';
  const anchorIdx = restCode.indexOf(anchor);
  if (anchorIdx !== -1) {
    const splitPoint = anchorIdx + anchor.length;
    const importsAndHeader = restCode.slice(0, splitPoint);
    const body = restCode.slice(splitPoint);
    
    // Put imports at top, then topFunctions, then body
    code = importsAndHeader + '\n\n' + topFunctions + '\n\n' + body;
    fs.writeFileSync(targetFile, code, 'utf8');
    console.log('[OK] Moved imports to top of file!');
  }
}

try {
  execSync(`node --check "${targetFile}"`);
  console.log('✅ SYNTAX VALID 100% FOR app/out/main/index.js!');
} catch (err) {
  console.error('❌ SYNTAX ERROR:', err.message);
}
