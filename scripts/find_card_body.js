const fs = require('fs');
const editor = fs.readFileSync('app/out/renderer/assets/WorkflowEditor-BFJj-KsD.js', 'utf8');
const p = editor.indexOf('e.type==="video-script-extract"');
console.log('Index:', p);
if (p !== -1) {
  console.log(editor.slice(p, p + 700));
}
