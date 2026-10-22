const fs = require('fs');
const runner = fs.readFileSync('app/out/renderer/assets/useWorkflowRunner-DGw6Ekx4.js', 'utf8');

const idx = runner.indexOf('H=await p(');
console.log('H=await p( at', idx);
if (idx !== -1) {
  // Tìm ngược lại xem p là tham số nào của hàm enclosing
  console.log(runner.slice(Math.max(0, idx - 1500), idx + 200));
}
