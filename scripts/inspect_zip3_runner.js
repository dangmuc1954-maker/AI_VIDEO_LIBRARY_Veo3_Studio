const fs = require('fs');

const zip3Runner = fs.readFileSync('scratch/zip3_source_app/resources/app/out/renderer/assets/useWorkflowRunner-BmcV20yZ.js', 'utf8');

// Extract the exact runner execution blocks
const dubStart = zip3Runner.indexOf('else if(r.type==="video-dubbing"||r.type==="dubbing"){');
const dubEnd = zip3Runner.indexOf('else if(r.type==="video-script-extract"||r.type==="stt"){', dubStart);
const sttEnd = zip3Runner.indexOf('else if(r.type==="prompt"||r.type==="text"){', dubEnd);

console.log('=== ZIP3 RUNNER BLOCKS ===');
console.log('dubbing block length:', dubEnd - dubStart);
console.log(zip3Runner.slice(dubStart, dubEnd));

console.log('stt block length:', sttEnd - dubEnd);
console.log(zip3Runner.slice(dubEnd, sttEnd));

fs.writeFileSync('scripts/zip3_runner_snippets.js', 
  '// DUBBING:\n' + zip3Runner.slice(dubStart, dubEnd) + '\n\n// STT:\n' + zip3Runner.slice(dubEnd, sttEnd), 
  'utf8'
);
