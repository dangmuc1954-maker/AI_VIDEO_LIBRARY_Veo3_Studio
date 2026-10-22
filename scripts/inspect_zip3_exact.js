const fs = require('fs');

const zip3Main = fs.readFileSync('scratch/zip3_source_app/resources/app/out/main/index.js', 'utf8');

// 1. Xem đầu file zip3 main
console.log('=== Head 500 chars of zip3 main ===');
console.log(zip3Main.slice(0, 500));

// 2. Tìm nodeFs và nodePath trong zip3 main
console.log('\n=== Search nodeFs in zip3 main ===');
let p = 0;
while ((p = zip3Main.indexOf('nodeFs', p)) !== -1) {
  console.log(`nodeFs at ${p}:`, zip3Main.slice(Math.max(0, p - 30), p + 60));
  p += 1;
}

console.log('\n=== Search transcribeVideoAudio in zip3 main ===');
p = 0;
while ((p = zip3Main.indexOf('transcribeVideoAudio', p)) !== -1) {
  console.log(`transcribeVideoAudio at ${p}:`, zip3Main.slice(Math.max(0, p - 30), p + 150));
  p += 1;
}
