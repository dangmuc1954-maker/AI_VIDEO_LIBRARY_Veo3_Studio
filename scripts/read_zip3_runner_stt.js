const fs = require('fs');
const content = fs.readFileSync('scratch/zip3_source_app/resources/app/out/renderer/assets/useWorkflowRunner-BmcV20yZ.js', 'utf8');

const idx = content.indexOf('video-script-extract');
console.log('video-script-extract in zip3 useWorkflowRunner:', idx);
if (idx !== -1) {
  console.log(content.slice(idx - 100, idx + 2000));
}
