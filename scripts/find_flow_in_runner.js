const fs = require('fs');
const zip3WfRunner = fs.readFileSync('scratch/zip3_source_app/resources/app/out/renderer/assets/useWorkflowRunner-BmcV20yZ.js', 'utf8');

// Tìm r.type === "google-flow"
let pos = 0;
while (true) {
  const idx = zip3WfRunner.indexOf('google-flow', pos);
  if (idx === -1) break;
  console.log(`google-flow at ${idx}:`);
  console.log(zip3WfRunner.slice(Math.max(0, idx - 40), idx + 200));
  pos = idx + 1;
}
