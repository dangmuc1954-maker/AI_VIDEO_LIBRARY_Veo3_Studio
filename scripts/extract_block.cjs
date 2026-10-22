const fs = require('fs');
const mainPath = 'app/out/main/index.js';
const code = fs.readFileSync(mainPath, 'utf8');

const sIdx = code.indexOf('// 3.5. KÍCH HOẠT KHUNG CHAT');
const eIdx = code.indexOf('tracker.updateProgress(35, "Prompt đã gửi thành công!');

console.log('sIdx:', sIdx, 'eIdx:', eIdx);
if (sIdx !== -1 && eIdx !== -1) {
  console.log('Block length:', eIdx - sIdx);
  fs.writeFileSync('scratch/current_attach_block.js', code.substring(sIdx, eIdx));
  console.log('Written to scratch/current_attach_block.js');
}
