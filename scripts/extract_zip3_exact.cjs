const fs = require('fs');
const path = require('path');

const base = path.resolve(__dirname, '../scratch/zip3_analysis/extracted_app_files/resources/app/out');

console.log('=== 1. main/index.js (transcribe & generateSmart) ===');
const mainCode = fs.readFileSync(path.join(base, 'main/index.js'), 'utf8');

function showContext(str, kw, radius = 300) {
  let pos = 0;
  let matches = [];
  while ((pos = str.toLowerCase().indexOf(kw.toLowerCase(), pos)) !== -1) {
    const start = Math.max(0, pos - radius);
    const end = Math.min(str.length, pos + kw.length + radius);
    matches.push({ pos, snippet: str.slice(start, end) });
    pos += kw.length;
  }
  return matches;
}

const mainMatches = showContext(mainCode, 'transcribe', 200);
mainMatches.forEach((m, i) => {
  console.log(`--- Match ${i+1} at pos ${m.pos} ---`);
  console.log(m.snippet);
});

console.log('=== 2. WorkflowEditor-BFJj-KsD.js (kịch bản) ===');
const wfCode = fs.readFileSync(path.join(base, 'renderer/assets/WorkflowEditor-BFJj-KsD.js'), 'utf8');
const wfMatches = showContext(wfCode, 'kịch bản', 250);
wfMatches.forEach((m, i) => {
  console.log(`--- WF Match ${i+1} at pos ${m.pos} ---`);
  console.log(m.snippet);
});

console.log('=== 3. useWorkflowRunner-BmcV20yZ.js (lồng tiếng & transcribe) ===');
const runnerCode = fs.readFileSync(path.join(base, 'renderer/assets/useWorkflowRunner-BmcV20yZ.js'), 'utf8');
const runnerMatches = showContext(runnerCode, 'lồng tiếng', 250);
runnerMatches.forEach((m, i) => {
  console.log(`--- Runner Match ${i+1} at pos ${m.pos} ---`);
  console.log(m.snippet);
});
