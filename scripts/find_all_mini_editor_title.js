const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'extracted_aiforge_studio', 'out', 'renderer', 'assets', 'index-DqhuWq2K.js');
const content = fs.readFileSync(file, 'utf8');

// Find all occurrences of miniEditorTitle
let idx = 0;
while ((idx = content.indexOf('miniEditorTitle', idx)) !== -1) {
  console.log(`Match at ${idx}:`);
  console.log(content.slice(Math.max(0, idx - 100), Math.min(content.length, idx + 800)));
  idx += 'miniEditorTitle'.length;
}
