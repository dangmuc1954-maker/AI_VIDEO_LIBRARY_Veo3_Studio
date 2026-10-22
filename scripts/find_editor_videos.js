const fs = require('fs');
const editor = fs.readFileSync('app/out/renderer/assets/WorkflowEditor-LHGC9K3C.js', 'utf8');

// Tìm tất cả các thẻ video trong WorkflowEditor
let pos = 0;
while (true) {
  const idx = editor.indexOf('t.jsx("video"', pos);
  if (idx === -1) break;
  console.log('Video element at', idx);
  console.log(editor.slice(idx, idx + 350));
  pos = idx + 1;
}
