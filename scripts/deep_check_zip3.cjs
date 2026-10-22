const fs = require('fs');
const path = require('path');

const base = path.resolve(__dirname, '../scratch/zip3_analysis/extracted_app_files/resources/app/out');

console.log('=== 1. Checking main/index.js ===');
const mainCode = fs.readFileSync(path.join(base, 'main/index.js'), 'utf8');
console.log('main/index.js length:', mainCode.length);

// Check keywords
['transcribe', 'script', 'dubbing', 'video-script', 'smartDialogue', 'generateSmart'].forEach(kw => {
  let count = 0;
  let pos = 0;
  while ((pos = mainCode.toLowerCase().indexOf(kw.toLowerCase(), pos)) !== -1) {
    count++;
    pos += kw.length;
  }
  console.log(`Keyword "${kw}" count:`, count);
});

console.log('\n=== 2. Checking WorkflowEditor-BFJj-KsD.js ===');
const wfCode = fs.readFileSync(path.join(base, 'renderer/assets/WorkflowEditor-BFJj-KsD.js'), 'utf8');
console.log('WorkflowEditor length:', wfCode.length);
['kịch bản', 'lồng tiếng', 'dubbing', 'transcribe', 'script'].forEach(kw => {
  let count = 0;
  let pos = 0;
  while ((pos = wfCode.toLowerCase().indexOf(kw.toLowerCase(), pos)) !== -1) {
    count++;
    pos += kw.length;
  }
  console.log(`Keyword "${kw}" count:`, count);
});

console.log('\n=== 3. Checking useWorkflowRunner-BmcV20yZ.js ===');
const runnerCode = fs.readFileSync(path.join(base, 'renderer/assets/useWorkflowRunner-BmcV20yZ.js'), 'utf8');
console.log('runner length:', runnerCode.length);
['kịch bản', 'lồng tiếng', 'dubbing', 'transcribe', 'script', 'elevenlabs', 'tts'].forEach(kw => {
  let count = 0;
  let pos = 0;
  while ((pos = runnerCode.toLowerCase().indexOf(kw.toLowerCase(), pos)) !== -1) {
    count++;
    pos += kw.length;
  }
  console.log(`Keyword "${kw}" count:`, count);
});
