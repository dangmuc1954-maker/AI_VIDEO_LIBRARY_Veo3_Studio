const fs = require('fs');
const path = require('path');

const curPath = path.resolve(__dirname, '../app/out/renderer/assets/useWorkflowRunner-DGw6Ekx4.js');
const zip3Path = path.resolve(__dirname, '../scratch/zip3_analysis/extracted_app_files/resources/app/out/renderer/assets/useWorkflowRunner-BmcV20yZ.js');

const curCode = fs.readFileSync(curPath, 'utf8');
const zip3Code = fs.readFileSync(zip3Path, 'utf8');

const curIdx = curCode.indexOf('video-script-extract');
const zip3Idx = zip3Code.indexOf('video-script-extract');

console.log('Cur video-script-extract:');
console.log(curCode.slice(curIdx - 50, curIdx + 1200));

console.log('\n=======================================\n');

console.log('Zip3 video-script-extract:');
console.log(zip3Code.slice(zip3Idx - 50, zip3Idx + 1200));
