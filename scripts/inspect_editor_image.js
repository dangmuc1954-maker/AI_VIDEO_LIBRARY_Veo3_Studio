const fs = require('fs');

const editorCode = fs.readFileSync('app/out/renderer/assets/WorkflowEditor-BFJj-KsD.js', 'utf8');

console.log('--- Match 3 (Card Body of image) ---');
console.log(editorCode.substring(387900, 390000));
