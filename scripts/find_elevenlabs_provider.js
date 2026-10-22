const fs = require('fs');
const runner = fs.readFileSync('app/out/renderer/assets/useWorkflowRunner-BmcV20yZ.js', 'utf8');
const p = runner.indexOf('providerId:"elevenlabs"');
console.log(runner.slice(p - 300, p + 300));
