const fs = require('fs');

const editor = fs.readFileSync('app/out/renderer/assets/WorkflowEditor-LHGC9K3C.js', 'utf8');

console.log('Around 269716 in ourEditor:');
console.log(editor.slice(269000, 270500));
