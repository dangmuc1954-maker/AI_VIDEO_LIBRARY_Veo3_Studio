const fs = require('fs');
const path = require('path');

const editorPath = path.join(__dirname, '../app/out/renderer/assets/WorkflowEditor-BFJj-KsD.js');
let editorCode = fs.readFileSync(editorPath, 'utf8');

editorCode = editorCode.replace(/"Bóc kịch bản lời thoại"/g, '"Âm thanh → Văn bản"');
editorCode = editorCode.replace(/"Kịch bản đã bóc:"/g, '"Kịch bản lời thoại (có thể gõ sửa):"');
editorCode = editorCode.replace(/"Bóc lại"/g, '"Nhận diện lại"');

fs.writeFileSync(editorPath, editorCode, 'utf8');
console.log('✓ Đã cập nhật nhãn trực quan trong WorkflowEditor!');
