const fs = require('fs');
const path = require('path');

const zip3Main = fs.readFileSync(path.resolve(__dirname, '../scratch/zip3_analysis/extracted_app_files/resources/app/out/main/index.js'), 'utf8');

let pos = 0;
while ((pos = zip3Main.indexOf('transcribeVideoAudio', pos)) !== -1) {
  console.log(`--- At pos ${pos} ---`);
  console.log(zip3Main.slice(Math.max(0, pos - 150), pos + 250));
  pos += 20;
}
