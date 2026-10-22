const fs = require('fs');
const editor = fs.readFileSync('app/out/renderer/assets/WorkflowEditor-BFJj-KsD.js', 'utf8');
console.log(editor.slice(398800, 399600));
