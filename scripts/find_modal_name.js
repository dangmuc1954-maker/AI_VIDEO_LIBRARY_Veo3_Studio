const fs = require('fs');

const editor = fs.readFileSync('app/out/renderer/assets/WorkflowEditor-LHGC9K3C.js', 'utf8');

const p = editor.indexOf('({x:e,y:r,onClose:o,onAddNode:n,suggestedPort:s})=>');
console.log('Before modal comp:');
console.log(editor.slice(p - 100, p + 50));
