const fs = require('fs');
const runner = fs.readFileSync('app/out/renderer/assets/useWorkflowRunner-DGw6Ekx4.js', 'utf8');

// Tìm r.type === "merge" hoặc r.type === "delay" hoặc r.type === "elevenlabs" trong runner
const mergeIdx = runner.indexOf('r.type==="merge"');
console.log('r.type==="merge" at', mergeIdx);
if (mergeIdx !== -1) {
  console.log(runner.slice(mergeIdx - 100, mergeIdx + 400));
}

const elIdx = runner.indexOf('r.type==="elevenlabs"');
console.log('\nr.type==="elevenlabs" at', elIdx);
if (elIdx !== -1) {
  console.log(runner.slice(elIdx - 100, elIdx + 400));
}
