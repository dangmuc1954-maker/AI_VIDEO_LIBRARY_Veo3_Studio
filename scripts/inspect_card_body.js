const fs = require('fs');
const editor = fs.readFileSync('app/out/renderer/assets/WorkflowEditor-LHGC9K3C.js', 'utf8');

// Tìm xem f trong component Ap có phải là hàm updateConfig không:
const cardBodyIdx = editor.indexOf('e.type==="video-script-extract"');
console.log('cardBodyIdx at', cardBodyIdx);
console.log(editor.slice(cardBodyIdx, cardBodyIdx + 1000));
