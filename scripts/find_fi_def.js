const fs = require('fs');

const editor = fs.readFileSync('app/out/renderer/assets/WorkflowEditor-LHGC9K3C.js', 'utf8');

// Find definition of Fi
let p = editor.indexOf('Fi=');
console.log('Fi= at', p);
if (p !== -1) {
  console.log(editor.slice(p - 50, p + 500));
} else {
  let p2 = editor.indexOf('function Fi');
  console.log('function Fi at', p2);
  if (p2 !== -1) console.log(editor.slice(p2 - 50, p2 + 500));
}
