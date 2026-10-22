const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../app/out/renderer/assets/WorkflowEditor-BFJj-KsD.js');
const s = fs.readFileSync(file, 'utf8');

const regex = /\{type:"([a-z0-9-]+)",title:"([^"]+)"/g;
let match;
const found = [];
while ((match = regex.exec(s)) !== null) {
  if (!found.some(x => x.type === match[1])) {
    found.push({ type: match[1], title: match[2] });
  }
}
console.log('Total node types found:', found.length);
found.forEach(n => console.log('  ', n.type, '->', n.title));
