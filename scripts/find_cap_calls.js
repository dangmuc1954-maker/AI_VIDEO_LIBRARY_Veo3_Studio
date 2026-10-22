const fs = require('fs');

function checkCapCalls(file) {
  console.log('=== Checking', file, '===');
  const content = fs.readFileSync(file, 'utf8');
  // find import of licenseCapabilities
  const match = content.match(/from"\.\/licenseCapabilities-HpsCBvbh\.js"/);
  console.log('Import found:', !!match);
  
  // Find calls to capabilities
  const re = /(?:hasCapability|useCapability|useHasCapability|[a-zA-Z0-9_$]+)\(["'](upscale|remove_watermark|watermark)[^"']*["']\)/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    console.log('Match:', m[0], 'around:', content.slice(Math.max(0, m.index - 100), Math.min(content.length, m.index + 150)));
  }
}

checkCapCalls('extracted_original_20260912/out/renderer/assets/VideoStudio-frcr8V6s.js');
checkCapCalls('extracted_original_20260912/out/renderer/assets/ImageStudio-4nmpUX3j.js');
