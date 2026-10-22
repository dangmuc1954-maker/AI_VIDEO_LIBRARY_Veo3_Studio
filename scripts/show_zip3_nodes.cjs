const fs = require('fs');
const path = require('path');

const base = path.resolve(__dirname, '../scratch/zip3_analysis/extracted_app_files/resources/app/out');

console.log('=== 1. main/index.js - transcribeVideoAudio implementation ===');
const mainCode = fs.readFileSync(path.join(base, 'main/index.js'), 'utf8');

// Find transcribeVideoAudio in main/index.js
const transIdx = mainCode.indexOf('transcribeVideoAudio');
if (transIdx !== -1) {
  console.log(mainCode.slice(transIdx - 100, transIdx + 3000));
} else {
  console.log('transcribeVideoAudio not found by exact string');
}

console.log('\n=== 2. useWorkflowRunner - video-script-extract block ===');
const runnerCode = fs.readFileSync(path.join(base, 'renderer/assets/useWorkflowRunner-BmcV20yZ.js'), 'utf8');
const scriptNodeIdx = runnerCode.indexOf('video-script-extract');
if (scriptNodeIdx !== -1) {
  console.log(runnerCode.slice(scriptNodeIdx - 50, scriptNodeIdx + 2000));
}

console.log('\n=== 3. WorkflowEditor - Bóc kịch bản M(e.id) definition ===');
const wfCode = fs.readFileSync(path.join(base, 'renderer/assets/WorkflowEditor-BFJj-KsD.js'), 'utf8');
const mFuncIdx = wfCode.indexOf('Bóc kịch bản ngay');
if (mFuncIdx !== -1) {
  console.log(wfCode.slice(mFuncIdx - 1200, mFuncIdx + 500));
}
