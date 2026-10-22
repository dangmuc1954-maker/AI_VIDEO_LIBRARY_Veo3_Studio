const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/WorkflowEditor-LHGC9K3C.js', 'utf8');

// Tìm hàm tạo Lucide icon (thường là Ae(...) hoặc similar)
// Tìm chuỗi "Merge" trong WorkflowEditor-LHGC9K3C.js
let pos = 0;
while (true) {
  const idx = content.indexOf('"Merge"', pos);
  if (idx === -1) break;
  console.log(`Merge icon definition candidate around ${idx}:`);
  console.log(content.slice(Math.max(0, idx - 40), idx + 80));
  pos = idx + 1;
}

// Tìm icon Play / PlayCircle
pos = 0;
while (true) {
  const idx = content.indexOf('"Play"', pos);
  if (idx === -1) break;
  console.log(`Play icon definition candidate around ${idx}:`);
  console.log(content.slice(Math.max(0, idx - 40), idx + 80));
  pos = idx + 1;
  if (pos > 50000) break;
}
