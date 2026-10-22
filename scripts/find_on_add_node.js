const fs = require('fs');

const editor = fs.readFileSync('app/out/renderer/assets/WorkflowEditor-LHGC9K3C.js', 'utf8');

const p = editor.indexOf('onAddNode:n,suggestedPort:s');
console.log('p at', p);
console.log(editor.slice(p - 60, p + 40));
