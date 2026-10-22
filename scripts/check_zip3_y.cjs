const fs = require('fs');
const path = require('path');

const zip3Runner = fs.readFileSync(path.resolve(__dirname, '../scratch/zip3_analysis/extracted_app_files/resources/app/out/renderer/assets/useWorkflowRunner-BmcV20yZ.js'), 'utf8');

// Find how y is passed or defined in runNode
const runNodeIdx = zip3Runner.indexOf('video-script-extract');
// search backwards for the start of the function containing video-script-extract
const before = zip3Runner.slice(Math.max(0, runNodeIdx - 1500), runNodeIdx);
console.log('--- Before video-script-extract in zip3 ---');
console.log(before);
