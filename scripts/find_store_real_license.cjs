const fs = require('fs');
const content = fs.readFileSync('scripts/extracted/WorkflowStore.js', 'utf-8');

// Find occurrences of license outside comments
const lines = content.split('\n');
// Since it's bundled on one line mostly, let's search for words like license, entitlement, getCatalog, etc.
let regex = /licenseRequired|getCatalog|licenseState|entitlement/g;
let m;
while ((m = regex.exec(content)) !== null) {
  const start = Math.max(0, m.index - 200);
  const end = Math.min(content.length, m.index + 200);
  console.log(`Match ${m[0]} at ${m.index}:`);
  console.log(content.substring(start, end));
  console.log('-------------------------------------------');
}
