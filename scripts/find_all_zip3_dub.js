const fs = require('fs');
const content = fs.readFileSync('scratch/zip3_source_app/resources/app/out/renderer/assets/WorkflowEditor-BFJj-KsD.js', 'utf8');

let pos = 0;
while (true) {
  const idx = content.indexOf('video-dubbing', pos);
  if (idx === -1) break;
  console.log(`=== Match at ${idx} ===`);
  console.log(content.slice(Math.max(0, idx - 150), idx + 250));
  pos = idx + 1;
}
