const fs = require('fs');

const editor = fs.readFileSync('app/out/renderer/assets/WorkflowEditor-LHGC9K3C.js', 'utf8');

let p = editor.indexOf('ji=');
console.log('ji= at', p);
if (p !== -1) {
  console.log(editor.slice(p - 50, p + 500));
}
