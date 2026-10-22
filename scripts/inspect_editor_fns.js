const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '..', 'extracted_editor_comp.js'), 'utf8');

// Find all function definitions in extracted_editor_comp.js
const fnMatches = [...content.matchAll(/function\s+([a-zA-Z0-9_$]+)\s*\(/g)];
console.log('Functions found:', fnMatches.map(m => m[1]));

// Let's print the functions that return JSX
for (const m of fnMatches) {
  const fnName = m[1];
  const idx = m.index;
  console.log(`\n--- Function ${fnName} at ${idx} ---`);
  console.log(content.slice(idx, idx + 400));
}
