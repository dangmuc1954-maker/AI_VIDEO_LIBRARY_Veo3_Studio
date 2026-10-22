const fs = require('fs');

const zip3Editor = fs.readFileSync('scratch/zip3_source_app/resources/app/out/renderer/assets/WorkflowEditor-BFJj-KsD.js', 'utf8');

function findContext(name, query, lenBefore = 100, lenAfter = 600) {
  const p = zip3Editor.indexOf(query);
  console.log(`\n=== ${name} (at ${p}) ===`);
  if (p !== -1) {
    console.log(zip3Editor.slice(Math.max(0, p - lenBefore), p + lenAfter));
  } else {
    console.log('NOT FOUND');
  }
}

findContext('Port Sets', 'video:new Set(["google-flow","grok"');
findContext('Node Instantiation', 'case "video-dubbing":return{id:r');
findContext('Icon Dubbing', 'case "video-dubbing":return t.jsx("div",{className:`${n} rounded-lg bg-[#8b5cf6]');
findContext('Icon STT', 'case"video-script-extract":return t.jsx("div",{className:`${n} rounded-lg bg-[#10b981]');
findContext('Card Body Dubbing', 'e.type==="video-dubbing"&&t.jsxs("div"');
findContext('Card Body STT', 'e.type==="video-script-extract"&&t.jsxs("div"');
findContext('Catalog Items', '{type:"video-dubbing",title:"Lồng Tiếng & Đồng Bộ Video"');
