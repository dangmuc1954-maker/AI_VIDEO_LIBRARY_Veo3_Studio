const fs = require('fs');

const zip3Main = fs.readFileSync('scratch/zip3_source_app/resources/app/out/main/index.js', 'utf8');

// Tìm chính xác nơi khai báo nodeFs và nodePath trong zip3
let pos = 0;
while ((pos = zip3Main.indexOf('nodeFs', pos)) !== -1) {
  console.log(`nodeFs in zip3 at ${pos}:`);
  console.log(zip3Main.slice(Math.max(0, pos - 100), pos + 100));
  pos += 1;
  if (pos > 10000) break;
}
