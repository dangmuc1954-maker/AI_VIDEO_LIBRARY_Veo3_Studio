const fs = require('fs');
const editor = fs.readFileSync('app/out/renderer/assets/WorkflowEditor-LHGC9K3C.js', 'utf8');

const apStart = 387564;
const apEnd = 435000;
const chunk = editor.slice(apStart, apEnd);

let p = 0;
while ((p = chunk.indexOf('t.jsx(At', p)) !== -1) {
  console.log('Action bar button candidate around', p + apStart);
  console.log(chunk.slice(Math.max(0, p - 100), p + 100));
  p += 1;
}
