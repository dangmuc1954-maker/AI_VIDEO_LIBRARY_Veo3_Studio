const fs = require('fs');

const editor = fs.readFileSync('app/out/renderer/assets/WorkflowEditor-LHGC9K3C.js', 'utf8');

// Find select-item in createNode
let p = 0;
while ((p = editor.indexOf('select-item', p)) !== -1) {
  console.log('select-item at', p, ':\n', editor.slice(Math.max(0, p - 60), p + 140));
  p += 'select-item'.length;
}
