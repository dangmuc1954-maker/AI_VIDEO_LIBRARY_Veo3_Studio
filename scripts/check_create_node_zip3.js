const fs = require('fs');

const zip3Editor = fs.readFileSync('scratch/zip3_source_app/resources/app/out/renderer/assets/WorkflowEditor-BFJj-KsD.js', 'utf8');

console.log('Around 211320 in zip3Editor:');
console.log(zip3Editor.slice(211100, 211500));
