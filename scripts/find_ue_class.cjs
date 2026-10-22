const fs = require('fs');
const content = fs.readFileSync('scripts/extracted/main_index.js', 'utf-8');

// Find occurrences of ue.getCatalog or ue =
const idx = content.indexOf('ue.getCatalog');
console.log('ue.getCatalog at:', idx);
// Search backward for "ue=" or "ue =" or "const ue" or "let ue"
const before = content.substring(idx - 10000, idx);
const match = before.match(/(?:const|let|var)\s+ue\s*=[^;]+/g);
console.log('Matches for ue definition:');
console.log(match);

// Also look at class or function of WorkflowStore client
const m2 = before.match(/class\s+\w+\s*\{[^}]*getCatalog/g);
console.log('Class with getCatalog:');
console.log(m2);

// Search for "getCatalog" in the whole file
let pos = 0;
while ((pos = content.indexOf('getCatalog', pos)) !== -1) {
  console.log('Found getCatalog at:', pos);
  console.log(content.substring(Math.max(0, pos - 200), Math.min(content.length, pos + 300)));
  console.log('-------------------------------');
  pos += 10;
}
