const fs = require('fs');

const zip3Editor = fs.readFileSync('scratch/zip3_source_app/resources/app/out/renderer/assets/WorkflowEditor-BFJj-KsD.js', 'utf8');

const sttStart = zip3Editor.indexOf('e.type==="video-script-extract"&&t.jsxs("div"');
const dubStart = zip3Editor.indexOf('e.type==="video-dubbing"&&t.jsxs("div"');
const dubEnd = zip3Editor.indexOf(',e.type==="text-splitter"&&t.jsxs("div"', dubStart);

console.log('STT Card Body:');
console.log(zip3Editor.slice(sttStart, dubStart));

console.log('\nDubbing Card Body:');
console.log(zip3Editor.slice(dubStart, dubEnd));

fs.writeFileSync('scripts/extracted_card_bodies.js',
  '// STT CARD BODY:\n' + zip3Editor.slice(sttStart, dubStart) + '\n\n// DUBBING CARD BODY:\n' + zip3Editor.slice(dubStart, dubEnd),
  'utf8'
);
