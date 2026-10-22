const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../app/out/renderer/assets/WorkflowEditor-BFJj-KsD.js');
const s = fs.readFileSync(file, 'utf8');

const idx = s.indexOf('case"image":');
console.log('image definition in editor:');
console.log(s.slice(idx, idx + 400));
