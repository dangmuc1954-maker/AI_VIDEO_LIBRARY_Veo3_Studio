const fs = require('fs');
const content = fs.readFileSync('scratch/zip3_source_app/resources/app/out/renderer/assets/WorkflowEditor-BFJj-KsD.js', 'utf8');
const head = content.slice(0, 3000);
console.log('Head imports of zip3:');
console.log(head);
