const fs = require('fs');
const path = require('path');

const editorPath = path.join(__dirname, '../app/out/renderer/assets/WorkflowEditor-BFJj-KsD.js');
let content = fs.readFileSync(editorPath, 'utf8');

content = content.replace(/title:"AI Bóc Kịch Bản Video"/g, 'title:"Đọc Kịch Bản (Âm thanh → Văn bản)"');
content = content.replace(/desc:"Nghe và bóc tách kịch bản lời thoại nhân vật từ video Veo 3 để đưa vào ElevenLabs"/g, 'desc:"Nhận video Veo 3, trích xuất âm thanh và chuyển thành văn bản lời thoại để đưa lên ElevenLabs"');
content = content.replace(/>"Bóc kịch bản lời thoại"/g, '>"Chuyển âm thanh sang văn bản"');
content = content.replace(/>"Kịch bản đã bóc:"/g, '>"Văn bản lời thoại đã nhận diện:"');
content = content.replace(/>"Nối Video Veo 3 vào node này để bóc kịch bản tự động"/g, '>"Nối Video Veo 3 vào node này để chuyển âm thanh sang văn bản tự động"');

fs.writeFileSync(editorPath, content, 'utf8');
console.log('✓ Đã cập nhật UI WorkflowEditor trực quan & chuẩn xác theo ý Tris!');
