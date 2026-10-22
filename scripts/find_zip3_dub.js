const fs = require('fs');
const path = require('path');

// Tìm trong zip3_source_app
const files = fs.readdirSync('scratch/zip3_source_app/resources/app/out/renderer/assets');
const wfFile = files.find(f => f.startsWith('WorkflowEditor-') && f.endsWith('.js'));
console.log('wfFile in zip3:', wfFile);

if (wfFile) {
  const content = fs.readFileSync(path.join('scratch/zip3_source_app/resources/app/out/renderer/assets', wfFile), 'utf8');
  const dubIdx = content.indexOf('"video-dubbing"');
  console.log('video-dubbing in zip3:', dubIdx);
  if (dubIdx !== -1) {
    console.log(content.slice(dubIdx - 100, dubIdx + 300));
  }
  const sttIdx = content.indexOf('"video-script-extract"');
  console.log('video-script-extract in zip3:', sttIdx);
  if (sttIdx !== -1) {
    console.log(content.slice(sttIdx - 100, sttIdx + 300));
  }
}
