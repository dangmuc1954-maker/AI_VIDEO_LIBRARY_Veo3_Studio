const fs = require('fs');
const runner = fs.readFileSync('app/out/renderer/assets/useWorkflowRunner-DGw6Ekx4.js', 'utf8');

const idx = runner.indexOf('r.type==="video-dubbing"');
console.log(runner.slice(idx - 50, idx + 4000));
