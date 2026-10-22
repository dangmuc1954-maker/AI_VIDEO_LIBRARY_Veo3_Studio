const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../app/out/renderer/assets/useWorkflowRunner-BmcV20yZ.js');
const s = fs.readFileSync(file, 'utf8');
const idx = s.indexOf('video-script-extract');
console.log('Index:', idx);
console.log(s.slice(idx - 100, idx + 1200));
