const fs = require('fs');
const runner = fs.readFileSync('app/out/renderer/assets/useWorkflowRunner-DGw6Ekx4.js', 'utf8');

// Tìm r.type === "google-flow" trong runner
const idx = runner.indexOf('r.type==="google-flow"');
console.log('r.type==="google-flow" at', idx);
if (idx !== -1) {
  console.log(runner.slice(idx - 50, idx + 1500));
}
