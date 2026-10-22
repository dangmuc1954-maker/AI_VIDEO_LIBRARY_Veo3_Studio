const fs = require('fs');
const editor = fs.readFileSync('app/out/renderer/assets/WorkflowEditor-LHGC9K3C.js', 'utf8');

const idx2 = editor.indexOf('e.type==="video-script-extract"', 248840 + 100);
console.log('idx2 at', idx2);
console.log(editor.slice(idx2, idx2 + 1500));
