const fs = require('fs');

const ourEditor = fs.readFileSync('app/out/renderer/assets/WorkflowEditor-LHGC9K3C.js', 'utf8');

let p = 0;
while ((p = ourEditor.indexOf('case"prompt":', p)) !== -1) {
  console.log('case"prompt": at', p, ':\n', ourEditor.slice(p - 30, p + 180));
  p += 'case"prompt":'.length;
}
