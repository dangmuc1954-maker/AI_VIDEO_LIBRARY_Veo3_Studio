const fs = require('fs');
const runner = fs.readFileSync('app/out/renderer/assets/useWorkflowRunner-DGw6Ekx4.js', 'utf8');

// Tìm conn.toNode hoặc .toNode hoặc .fromNode
const matches = runner.match(/(?:[a-zA-Z0-9_$]+)\.filter\([^)]*toNode[^)]*\)/g);
console.log('Matches for toNode filter:', matches);

// Tìm tất cả nơi xuất hiện fromNode
const fnMatches = [];
let p = 0;
while ((p = runner.indexOf('fromNode', p)) !== -1) {
  fnMatches.push(runner.slice(Math.max(0, p - 60), p + 60));
  p += 1;
}
console.log('\nAll occurrences of fromNode:');
fnMatches.forEach((m, i) => console.log(`  [${i}] ${m}`));
