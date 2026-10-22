const fs = require('fs');

const ourEditor = fs.readFileSync('app/out/renderer/assets/WorkflowEditor-LHGC9K3C.js', 'utf8');

// In ourEditor, find createNode
// Let's search for type:"prompt"
let p = 0;
while ((p = ourEditor.indexOf('type:"prompt"', p)) !== -1) {
  console.log('type:"prompt" at', p, ':\n', ourEditor.slice(p - 60, p + 140));
  p += 'type:"prompt"'.length;
}
