const fs = require('fs');
const editor = fs.readFileSync('app/out/renderer/assets/WorkflowEditor-LHGC9K3C.js', 'utf8');

// Tìm các chỗ gọi v(e.id)
let p = 0;
while ((p = editor.indexOf('v(e.id)', p)) !== -1) {
  console.log('v(e.id) at', p);
  console.log(editor.slice(Math.max(0, p - 80), p + 100));
  p += 1;
}
