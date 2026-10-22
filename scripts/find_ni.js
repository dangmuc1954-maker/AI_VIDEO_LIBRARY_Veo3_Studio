const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/WorkflowEditor-LHGC9K3C.js', 'utf8');
const idx = 635546;
const chunk = content.slice(idx - 10000, idx + 1000);
// Tìm 'function ni(' hoặc 'const ni=' hoặc 'let ni='
const regex = /(?:function ni\b|ni\s*=\s*(?:\([^)]*\)|[a-zA-Z0-9_$]+)\s*=>)/g;
let match;
while ((match = regex.exec(content)) !== null) {
  console.log('Found ni at:', match.index, content.slice(match.index, match.index + 200));
}

// Hoặc tìm switch case mà chúng ta đã sửa trong 5a:
// "case"video-dubbing":return t.jsx("div",{className:`${n} rounded-lg bg-[#8b5cf6]/15 text-[#a78bfa]`,title:"Lồng Tiếng & Đồng Bộ Video",children:t.jsx(Id,{size:14})});"
console.log('\nTìm Id và oo trong file:');
const dubIdx = content.indexOf('video-dubbing');
console.log('video-dubbing at:', dubIdx);
console.log(content.slice(dubIdx - 100, dubIdx + 400));
