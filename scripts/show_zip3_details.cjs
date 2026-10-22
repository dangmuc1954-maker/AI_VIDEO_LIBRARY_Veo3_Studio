const fs = require('fs');
const path = require('path');

const base = path.resolve(__dirname, '../scratch/zip3_analysis/extracted_app_files/resources/app/out');

console.log('=== 1. FULL transcribeVideoAudio in main/index.js ===');
const mainCode = fs.readFileSync(path.join(base, 'main/index.js'), 'utf8');
const transIdx = mainCode.indexOf('async transcribeVideoAudio(');
console.log(mainCode.slice(transIdx, transIdx + 5500));

console.log('\n=== 2. FULL M(nodeId) in WorkflowEditor-BFJj-KsD.js ===');
const wfCode = fs.readFileSync(path.join(base, 'renderer/assets/WorkflowEditor-BFJj-KsD.js'), 'utf8');
const bockbIdx = wfCode.indexOf('Bóc kịch bản ngay');
// Search backwards for definition of M = async or const M =
const before = wfCode.slice(Math.max(0, bockbIdx - 2000), bockbIdx);
console.log(before);
