const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/WorkflowEditor-LHGC9K3C.js', 'utf8');
console.log(content.slice(0, 2000));
