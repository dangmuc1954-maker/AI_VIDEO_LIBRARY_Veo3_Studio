const fs = require('fs');
const path = require('path');

const origFile = path.join(__dirname, '..', 'extracted_aiforge_studio', 'out', 'renderer', 'assets', 'VideoStudio-CbTMj2SN.js');
const code = fs.readFileSync(origFile, 'utf8');

const mnStart = code.indexOf('const mn=({isOpen:s,onClose:r,initialAssetIds:n})=>{');
console.log('mnStart:', mnStart);

// Body starts at "=>{"
const bodyStart = code.indexOf('=>{', mnStart) + 2;

let depth = 0;
let mnEnd = -1;

for (let i = bodyStart; i < code.length; i++) {
  if (code[i] === '{') {
    depth++;
  } else if (code[i] === '}') {
    depth--;
    if (depth === 0) {
      mnEnd = i + 1;
      break;
    }
  }
}

console.log('mnEnd:', mnEnd, 'Total length:', mnEnd - mnStart);
console.log('After mn:');
console.log(code.slice(mnEnd, mnEnd + 500));

// Write the whole mn component to a file
fs.writeFileSync(path.join(__dirname, '..', 'original_mn_exact.js'), code.slice(mnStart, mnEnd));
console.log('Wrote original_mn_exact.js');
