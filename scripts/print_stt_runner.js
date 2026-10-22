const fs = require('fs');
const runner = fs.readFileSync('app/out/renderer/assets/useWorkflowRunner-DGw6Ekx4.js', 'utf8');

const idx = runner.indexOf('cần 1 video đầu vào để chuyển âm thanh sang văn');
console.log(runner.slice(idx, idx + 2000));
