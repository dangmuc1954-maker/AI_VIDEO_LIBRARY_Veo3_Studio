const fs = require('fs');

const editor = fs.readFileSync('app/out/renderer/assets/WorkflowEditor-LHGC9K3C.js', 'utf8');

let p = editor.indexOf('Wx=');
console.log('Wx= at', p);
if (p !== -1) {
  console.log(editor.slice(p - 50, p + 500));
} else {
  let p2 = editor.indexOf('const Wx=');
  console.log('const Wx= at', p2);
  if (p2 !== -1) console.log(editor.slice(p2 - 50, p2 + 500));
}
