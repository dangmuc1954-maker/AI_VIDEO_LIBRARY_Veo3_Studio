const fs = require('fs');

const orig = fs.readFileSync('extracted_aiforge_studio_new/out/main/index.js', 'utf8');

console.log('=== SEARCHING FOR FLOW AUTOMATION & AUTH IN ORIGINAL ===');

// Search for all occurrences of flow in browser-view or session handlers
let idx = 0;
while ((idx = orig.indexOf('google-flow', idx)) !== -1) {
  console.log('--- google-flow at ' + idx + ' ---');
  console.log(orig.slice(idx, idx + 200));
  idx += 11;
}
