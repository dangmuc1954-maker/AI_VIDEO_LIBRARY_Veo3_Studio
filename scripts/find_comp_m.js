const fs = require('fs');
const editor = fs.readFileSync('app/out/renderer/assets/WorkflowEditor-LHGC9K3C.js', 'utf8');

const cardIdx = editor.indexOf('M(e.id)');
// Tìm function bao quanh cardIdx
const compStart = editor.lastIndexOf('function ', cardIdx);
console.log('compStart at', compStart);
console.log(editor.slice(compStart, compStart + 400));
