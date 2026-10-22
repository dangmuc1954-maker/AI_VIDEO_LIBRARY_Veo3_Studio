const fs = require('fs');

const editor = fs.readFileSync('app/out/renderer/assets/WorkflowEditor-LHGC9K3C.js', 'utf8');

let p = editor.indexOf('{type:"merge"');
console.log('{type:"merge" at', p);
console.log(editor.slice(p - 100, p + 500));
