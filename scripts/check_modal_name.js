const fs = require('fs');

const editor = fs.readFileSync('app/out/renderer/assets/WorkflowEditor-LHGC9K3C.js', 'utf8');

// Find where the modal is rendered, searching for AddNode or similar
const p = editor.indexOf('`Add node for ${s.displayName}`');
console.log('Context of modal definition:');
console.log(editor.slice(p - 600, p));
