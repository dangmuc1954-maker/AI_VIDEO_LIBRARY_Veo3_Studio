const fs = require('fs');

const editor = fs.readFileSync('app/out/renderer/assets/WorkflowEditor-LHGC9K3C.js', 'utf8');

function checkTarget(name, str) {
  const p = editor.indexOf(str);
  console.log(`${name}: ${p !== -1 ? 'FOUND at ' + p : 'NOT FOUND'}`);
  return p;
}

checkTarget('1. Allowed video in', 'video:new Set(["http-request","browser-request","download","delay","loop","condition","merge","select-item"])');
checkTarget('2. Allowed audio in', 'audio:new Set(["http-request","browser-request","download","delay","loop","condition","merge","select-item"])');
checkTarget('3. Connection video out', 'video:new Set(["google-flow","grok","delay","condition"])');
checkTarget('4. Connection audio out', 'audio:new Set(["chatgpt-synthesize","elevenlabs","delay","condition"])');
checkTarget('5. createNode select-item', 'case"select-item":return{id:r,type:"select-item"');
checkTarget('6. Icon select-item', 'case"select-item":return t.jsx("div",{className:`${n} rounded-lg bg-[#f43f5e]');
checkTarget('7. Border style convert-data', 'case"convert-data":return"border-[#22d3ee]');
checkTarget('8. Output preview assets', 'e.type==="merge"');
checkTarget('9. Card body text-splitter', 'e.type==="text-splitter"&&t.jsxs');
checkTarget('10. Catalog select-item', '{type:"select-item",title:"Select Item"');
