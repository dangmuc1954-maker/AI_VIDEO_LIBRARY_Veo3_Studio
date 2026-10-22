const fs = require('fs');
const zip3Main = fs.readFileSync('scratch/zip3_source_app/resources/app/out/main/index.js', 'utf8');

// Xem 4000 ký tự đầu của zip3 main
console.log('=== First 4000 chars of zip3 main ===');
console.log(zip3Main.slice(0, 4000));

// Tìm nơi gọi generateSmartVietnameseDialogue
console.log('\n=== Usages of generateSmartVietnameseDialogue in zip3 ===');
let p = 0;
while ((p = zip3Main.indexOf('generateSmartVietnameseDialogue', p)) !== -1) {
  console.log(`Called at ${p}:`);
  console.log(zip3Main.slice(Math.max(0, p - 60), p + 200));
  p += 1;
}
