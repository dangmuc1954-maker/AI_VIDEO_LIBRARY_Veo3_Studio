const fs = require('fs');

const editor = fs.readFileSync('app/out/renderer/assets/WorkflowEditor-LHGC9K3C.js', 'utf8');

let p = 0;
while ((p = editor.indexOf('onAddNode', p)) !== -1) {
  console.log('onAddNode at', p, ':\n', editor.slice(p - 50, p + 250));
  p += 'onAddNode'.length;
}
