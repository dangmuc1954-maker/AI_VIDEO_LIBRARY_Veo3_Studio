const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

const sIdx = content.indexOf('// 3.5. ĐÍNH KÈM ẢNH THAM CHIẾU');
const eIdx = content.indexOf('logDebug("Send prompt result", sendRes);');
console.log('Found block from', sIdx, 'to', eIdx);

const block = content.slice(sIdx, eIdx + 45);
fs.writeFileSync('scratch/current_attach_block.js', block);
console.log('Saved current_attach_block.js, length:', block.length);
