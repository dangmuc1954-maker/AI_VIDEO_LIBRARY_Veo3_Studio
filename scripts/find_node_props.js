const fs = require('fs');
const editor = fs.readFileSync('app/out/renderer/assets/WorkflowEditor-LHGC9K3C.js', 'utf8');

const cardIdx = editor.indexOf('M(e.id)');
const arrowIdx = editor.lastIndexOf('=>', cardIdx - 2000);
console.log('arrowIdx:', arrowIdx);
console.log(editor.slice(arrowIdx - 100, arrowIdx + 200));

// Tìm định nghĩa params của NodeCard component
const ncIdx = editor.lastIndexOf('({node:e', cardIdx);
console.log('({node:e at', ncIdx);
if (ncIdx !== -1) {
  console.log(editor.slice(ncIdx - 40, ncIdx + 250));
}
