const fs = require('fs');

const editor = fs.readFileSync('app/out/renderer/assets/WorkflowEditor-LHGC9K3C.js', 'utf8');

const p = editor.indexOf('`Add node for ${s.displayName}`');
const pStart = editor.lastIndexOf('const ', p - 2000);
console.log('Modal component header:');
console.log(editor.slice(pStart, pStart + 200));
