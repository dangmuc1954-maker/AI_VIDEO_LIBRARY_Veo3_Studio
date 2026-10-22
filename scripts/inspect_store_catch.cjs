const fs = require('fs');
const content = fs.readFileSync('scripts/extracted/WorkflowStore.js', 'utf-8');

console.log(content.substring(8300, 9300));
