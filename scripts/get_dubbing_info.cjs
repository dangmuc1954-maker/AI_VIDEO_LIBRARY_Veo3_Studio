const fs = require('fs');
const code = fs.readFileSync('scratch/zip3_analysis/extracted_app_files/resources/app/out/renderer/assets/WorkflowEditor-BFJj-KsD.js', 'utf8');

const idx = code.indexOf('type:"video-dubbing"');
if (idx !== -1) {
  console.log(code.slice(idx - 50, idx + 600));
}
