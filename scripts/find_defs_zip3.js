const fs = require('fs');
const content = fs.readFileSync('scratch/zip3_source_app/resources/app/out/renderer/assets/WorkflowEditor-BFJj-KsD.js', 'utf8');

function findDef(varName) {
  const reg = new RegExp(`(?:const|let|var)\\s+${varName}\\s*=`, 'g');
  let m;
  console.log(`Searching for ${varName}...`);
  while ((m = reg.exec(content)) !== null) {
    console.log(m.index, content.slice(m.index, m.index + 120));
  }
}

findDef('Id');
findDef('oo');
findDef('At');
