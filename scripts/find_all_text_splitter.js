const fs = require('fs');

const editor = fs.readFileSync('app/out/renderer/assets/WorkflowEditor-LHGC9K3C.js', 'utf8');

let p = 0;
while ((p = editor.indexOf('text-splitter', p)) !== -1) {
  console.log('text-splitter at', p, ':\n', editor.slice(Math.max(0, p - 60), p + 140));
  p += 'text-splitter'.length;
}
