const fs = require('fs');
const path = require('path');

function inspectContext(filePath, terms, contextLen = 200) {
  console.log(`=== Inspecting ${path.basename(filePath)} ===`);
  const content = fs.readFileSync(filePath, 'utf8');
  for (const term of terms) {
    let idx = 0;
    while ((idx = content.indexOf(term, idx)) !== -1) {
      const start = Math.max(0, idx - contextLen);
      const end = Math.min(content.length, idx + term.length + contextLen);
      console.log(`\n--- Match for "${term}" at index ${idx} ---`);
      console.log(content.slice(start, end));
      idx += term.length;
    }
  }
}

const basePath = path.join(__dirname, '..', 'extracted_aiforge_studio', 'out');
inspectContext(
  path.join(basePath, 'renderer', 'assets', 'index-DqhuWq2K.js'),
  ['Ghép tự động', 'Biên tập video', 'autoMerge'],
  300
);

inspectContext(
  path.join(basePath, 'renderer', 'assets', 'VideoStudio-CbTMj2SN.js'),
  ['autoMerge', 'biên tập', 'editor'],
  300
);
