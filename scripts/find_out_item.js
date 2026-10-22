const fs = require('fs');

const ourEditor = fs.readFileSync('app/out/renderer/assets/WorkflowEditor-LHGC9K3C.js', 'utf8');

let p = ourEditor.indexOf('out-item');
console.log('out-item at', p);
if (p !== -1) {
  console.log(ourEditor.slice(p - 150, p + 200));
}
