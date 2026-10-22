const fs = require('fs');
const path = require('path');

const editorPath = path.join(__dirname, '../app/out/renderer/assets/WorkflowEditor-LHGC9K3C.js');
let content = fs.readFileSync(editorPath, 'utf8');

const oldCode = 'case"video-dubbing":return t.jsx("div",{className:`${n} rounded-lg bg-[#8b5cf6]/15 text-[#a78bfa]`,title:"Lồng Tiếng & Đồng Bộ Video",children:t.jsx(Id,{size:14})});case"video-script-extract":return t.jsx("div",{className:`${n} rounded-lg bg-[#10b981]/15 text-[#34d399]`,title:"Đọc Kịch Bản (Âm thanh → Văn bản)",children:t.jsx(oo,{size:14})});';

const newCode = 'case"video-dubbing":return t.jsx("div",{className:`${n} rounded-lg bg-[#8b5cf6]/15 text-[#a78bfa]`,title:"Lồng Tiếng & Đồng Bộ Video",children:t.jsx(mu,{size:14})});case"video-script-extract":return t.jsx("div",{className:`${n} rounded-lg bg-[#10b981]/15 text-[#34d399]`,title:"Đọc Kịch Bản (Âm thanh → Văn bản)",children:t.jsx(Dm,{size:14})});';

if (content.includes(oldCode)) {
  content = content.replace(oldCode, newCode);
  fs.writeFileSync(editorPath, content, 'utf8');
  console.log('✓ Đã sửa thành công Id -> mu và oo -> Dm trong WorkflowEditor!');
} else {
  console.error('❌ Không tìm thấy oldCode!');
  process.exit(1);
}
