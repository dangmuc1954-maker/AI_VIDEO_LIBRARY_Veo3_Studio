const fs = require('fs');

const ourEditor = fs.readFileSync('app/out/renderer/assets/WorkflowEditor-LHGC9K3C.js', 'utf8');

console.log('Imports of our editor (first 1000 chars):');
console.log(ourEditor.slice(0, 1000));
