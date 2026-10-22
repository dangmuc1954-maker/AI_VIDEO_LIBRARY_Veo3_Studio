const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/WorkflowEditor-LHGC9K3C.js', 'utf8');

const regex = /const\s+([a-zA-Z0-9_$]+)\s*=\s*Le\(\s*["']([^"']+)["']/g;
let m;
const iconMap = {};
while ((m = regex.exec(content)) !== null) {
  iconMap[m[2]] = m[1];
}
console.log('All icons defined with Le in WorkflowEditor:', iconMap);
