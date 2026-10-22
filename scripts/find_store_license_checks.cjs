const fs = require('fs');
const content = fs.readFileSync('scripts/extracted/WorkflowStore.js', 'utf-8');

// Find license or entitlement checks in WorkflowStore.js
const regex = /license|entitlement|expired|active/gi;
let match;
let results = [];
while ((match = regex.exec(content)) !== null) {
  const start = Math.max(0, match.index - 100);
  const end = Math.min(content.length, match.index + 200);
  results.push(content.substring(start, end));
}

console.log(`Total occurrences: ${results.length}`);
results.slice(0, 10).forEach((r, i) => {
  console.log(`[${i}]`);
  console.log(r);
  console.log('---');
});
