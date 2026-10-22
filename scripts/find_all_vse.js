const fs = require('fs');
const editor = fs.readFileSync('app/out/renderer/assets/WorkflowEditor-BFJj-KsD.js', 'utf8');
let idx = 0;
while ((idx = editor.indexOf('video-script-extract', idx)) !== -1) {
  console.log('--- At', idx, '---');
  console.log(editor.slice(idx - 50, idx + 150));
  idx += 20;
}
