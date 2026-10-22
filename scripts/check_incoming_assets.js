const fs = require('fs');
const runner = fs.readFileSync('app/out/renderer/assets/useWorkflowRunner-DGw6Ekx4.js', 'utf8');

// Tìm cách node merge hoặc download lấy videos từ node trước
const mergeIdx = runner.indexOf('r.type==="merge"');
console.log(runner.slice(mergeIdx, mergeIdx + 1200));
