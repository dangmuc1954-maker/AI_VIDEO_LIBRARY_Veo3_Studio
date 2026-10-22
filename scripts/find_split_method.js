const fs = require('fs');

const ourEditor = fs.readFileSync('app/out/renderer/assets/WorkflowEditor-LHGC9K3C.js', 'utf8');

let p = ourEditor.indexOf('splitMethod:"parts"');
console.log('splitMethod:"parts" in ourEditor at', p);
if (p !== -1) {
  console.log(ourEditor.slice(p - 200, p + 500));
}
