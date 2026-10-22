const fs = require('fs');
const runner = fs.readFileSync('app/out/renderer/assets/useWorkflowRunner-DGw6Ekx4.js', 'utf8');

// Tìm hàm thực thi p(...)
// p được truyền vào hoặc khai báo ở đầu useWorkflowRunner hook
const hookIdx = runner.indexOf('useWorkflowRunner');
console.log('useWorkflowRunner at', hookIdx);

// Tìm nơi p được định nghĩa: const p = hoặc function p
const idx = runner.indexOf('const p=async');
console.log('const p=async at', idx);
if (idx !== -1) {
  console.log(runner.slice(idx, idx + 1000));
} else {
  // Tìm function p(
  const matches = runner.match(/(?:async function p\b|const p\s*=\s*async|let p\s*=\s*async)/g);
  console.log('Matches for async p:', matches);
}
