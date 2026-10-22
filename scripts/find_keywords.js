const fs = require('fs');
const code = fs.readFileSync('app/out/renderer/assets/VideoStudio-BZY_1pM8.js', 'utf8');

console.log('Searching in VideoStudio...');
['sr($,\"video\")', 'sr($,', 'overflow-auto', 'table-fixed', 'Phân cảnh', 'Lồng Tiếng'].forEach(k => {
  let idx = code.indexOf(k);
  console.log(k, 'at:', idx);
  if (idx !== -1) {
    console.log(code.slice(Math.max(0, idx - 60), Math.min(code.length, idx + 100)));
    console.log('---');
  }
});
