const fs = require('fs');
const path = require('path');

const zip3Runner = fs.readFileSync(path.resolve(__dirname, '../scratch/zip3_analysis/extracted_app_files/resources/app/out/renderer/assets/useWorkflowRunner-BmcV20yZ.js'), 'utf8');

const target = 'video-script-extract';
const idx = zip3Runner.indexOf(target);
console.log(zip3Runner.slice(idx - 50, idx + 1000));
