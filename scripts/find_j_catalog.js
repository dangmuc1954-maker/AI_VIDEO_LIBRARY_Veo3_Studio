const fs = require('fs');

const editor = fs.readFileSync('app/out/renderer/assets/WorkflowEditor-LHGC9K3C.js', 'utf8');

const p = editor.indexOf('nodeDesc_merge');
const pStart = editor.lastIndexOf('j=[', p);
console.log('j=[ at', pStart);
console.log(editor.slice(pStart - 300, pStart + 100));
