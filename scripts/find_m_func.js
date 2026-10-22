const fs = require('fs');
const editor = fs.readFileSync('app/out/renderer/assets/WorkflowEditor-LHGC9K3C.js', 'utf8');

// Tìm M(e.id) trong card body
const cardIdx = editor.indexOf('M(e.id)');
console.log('M(e.id) at', cardIdx);
if (cardIdx !== -1) {
  // Tìm định nghĩa của M trong component đó
  console.log('Context of M(e.id):');
  console.log(editor.slice(Math.max(0, cardIdx - 1500), cardIdx + 200));
}
