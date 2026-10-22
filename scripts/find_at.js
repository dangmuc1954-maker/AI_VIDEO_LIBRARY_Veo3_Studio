const fs = require('fs');
const content = fs.readFileSync('scratch/zip3_source_app/resources/app/out/renderer/assets/WorkflowEditor-BFJj-KsD.js', 'utf8');
let idx = content.indexOf('const At=');
console.log('const At= in zip3:', idx);
if (idx !== -1) {
  console.log(content.slice(idx, idx + 100));
} else {
  // Tìm At=Ae(
  idx = content.indexOf('At=Ae(');
  console.log('At=Ae(:', idx, content.slice(idx, idx + 100));
}
