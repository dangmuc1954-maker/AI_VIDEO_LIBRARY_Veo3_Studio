const fs = require('fs');

const editor = fs.readFileSync('app/out/renderer/assets/WorkflowEditor-LHGC9K3C.js', 'utf8');

let p = editor.indexOf('nodeDesc_select_item');
console.log(editor.slice(p + 1200, p + 2500));
