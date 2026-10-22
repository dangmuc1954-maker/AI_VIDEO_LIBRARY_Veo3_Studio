const fs = require('fs');

const editor = fs.readFileSync('app/out/renderer/assets/WorkflowEditor-LHGC9K3C.js', 'utf8');

const p = editor.indexOf('ji=C.useCallback(');
console.log(editor.slice(p, p + 2500));
