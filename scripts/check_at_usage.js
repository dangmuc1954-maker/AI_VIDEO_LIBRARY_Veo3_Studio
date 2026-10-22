const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/WorkflowEditor-LHGC9K3C.js', 'utf8');

let p = 0;
while ((p = content.indexOf('At', p)) !== -1) {
  // Tìm các chỗ dùng t.jsx(At hoặc tương tự
  const slice = content.slice(Math.max(0, p - 10), p + 20);
  if (slice.includes('t.jsx(At') || slice.includes('t.jsxs(At') || slice.includes('<At')) {
    console.log('Usage of At at', p, ':', slice);
  }
  p += 1;
}
