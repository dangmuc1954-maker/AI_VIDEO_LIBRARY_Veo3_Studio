const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/WorkflowStore-BIvOZ42B.js', 'utf-8');

const idx = content.indexOf('getCatalog()');
console.log('getCatalog() at:', idx);
console.log(content.substring(idx - 100, idx + 400));
