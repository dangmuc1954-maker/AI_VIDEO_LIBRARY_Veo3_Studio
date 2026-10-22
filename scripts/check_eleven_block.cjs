const fs = require('fs');
const curCode = fs.readFileSync('app/out/renderer/assets/useWorkflowRunner-DGw6Ekx4.js', 'utf8');
const curIdx = curCode.indexOf('type==="elevenlabs"');
console.log(curCode.slice(curIdx, curIdx + 1500));
