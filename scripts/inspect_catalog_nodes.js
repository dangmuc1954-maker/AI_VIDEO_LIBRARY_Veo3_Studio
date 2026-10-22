const fs = require('fs');

const zip3Editor = fs.readFileSync('scratch/zip3_source_app/resources/app/out/renderer/assets/WorkflowEditor-BFJj-KsD.js', 'utf8');
const ourEditor = fs.readFileSync('app/out/renderer/assets/WorkflowEditor-LHGC9K3C.js', 'utf8');

function extractCatalog(code) {
  const matches = [];
  const reg = /\{type:"([^"]+)",title:"([^"]+)"(?:,desc:"([^"]*)")?/g;
  let m;
  while ((m = reg.exec(code)) !== null) {
    matches.push({ type: m[1], title: m[2], desc: m[3] || '' });
  }
  return matches;
}

const zip3Nodes = extractCatalog(zip3Editor);
const ourNodes = extractCatalog(ourEditor);

console.log('=== ZIP3 CATALOG NODES (' + zip3Nodes.length + ') ===');
zip3Nodes.forEach(n => console.log(`- [${n.type}] ${n.title}: ${n.desc}`));

console.log('\n=== OUR APP CATALOG NODES (' + ourNodes.length + ') ===');
ourNodes.forEach(n => console.log(`- [${n.type}] ${n.title}: ${n.desc}`));
