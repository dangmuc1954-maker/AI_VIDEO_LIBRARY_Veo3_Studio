const fs = require('fs');

const editorCode = fs.readFileSync('scratch/zip3_source_app/resources/app/out/renderer/assets/WorkflowEditor-BFJj-KsD.js', 'utf8');
const runnerCode = fs.readFileSync('scratch/zip3_source_app/resources/app/out/renderer/assets/useWorkflowRunner-BmcV20yZ.js', 'utf8');

console.log('=== WORKFLOW EDITOR - NODE DEFINITIONS ===');
let p = 0;
while ((p = editorCode.indexOf('video-dubbing', p)) !== -1) {
  console.log(`\n--- video-dubbing at ${p} ---`);
  console.log(editorCode.slice(Math.max(0, p - 80), p + 250));
  p += 'video-dubbing'.length;
}

p = 0;
while ((p = editorCode.indexOf('video-script-extract', p)) !== -1) {
  console.log(`\n--- video-script-extract at ${p} ---`);
  console.log(editorCode.slice(Math.max(0, p - 80), p + 250));
  p += 'video-script-extract'.length;
}

console.log('\n=== WORKFLOW RUNNER - NODE EXECUTION ===');
p = 0;
while ((p = runnerCode.indexOf('video-dubbing', p)) !== -1) {
  console.log(`\n--- runner video-dubbing at ${p} ---`);
  console.log(runnerCode.slice(Math.max(0, p - 80), p + 300));
  p += 'video-dubbing'.length;
}

p = 0;
while ((p = runnerCode.indexOf('video-script-extract', p)) !== -1) {
  console.log(`\n--- runner video-script-extract at ${p} ---`);
  console.log(runnerCode.slice(Math.max(0, p - 80), p + 300));
  p += 'video-script-extract'.length;
}
