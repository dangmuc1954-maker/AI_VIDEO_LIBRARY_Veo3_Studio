const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'extracted_aiforge_studio', 'out', 'renderer', 'assets', 'VideoStudio-CbTMj2SN.js');
const content = fs.readFileSync(file, 'utf8');

// Get snippet of oa function
const funcStart = content.indexOf('function oa(){');
console.log('oa starts at:', funcStart);
if (funcStart !== -1) {
  const funcSlice = content.slice(funcStart, funcStart + 35000);
  // Find where E (setIsMergeModalOpen) is used
  let idx = 0;
  while ((idx = funcSlice.indexOf('E(', idx)) !== -1) {
    console.log(`\nE() call at offset ${idx}:`);
    console.log(funcSlice.slice(Math.max(0, idx - 100), Math.min(funcSlice.length, idx + 200)));
    idx += 2;
  }

  // Find where f (isMergeModalOpen) is used
  idx = 0;
  while ((idx = funcSlice.indexOf('isOpen:f', idx)) !== -1 || (idx = funcSlice.indexOf('open:f', idx)) !== -1) {
    console.log(`\nModal with f at offset ${idx}:`);
    console.log(funcSlice.slice(Math.max(0, idx - 100), Math.min(funcSlice.length, idx + 200)));
    idx += 6;
  }
}
