const fs = require('fs');
const path = require('path');

// 1. Kiểm tra transcribeVideoAudio trong main của zip3
const zip3Main = fs.readFileSync('scratch/zip3_source_app/resources/app/out/main/index.js', 'utf8');
let pos = 0;
while (true) {
  const idx = zip3Main.indexOf('transcribeVideoAudio', pos);
  if (idx === -1) break;
  console.log('transcribeVideoAudio in zip3 main at', idx);
  console.log(zip3Main.slice(idx - 100, idx + 800));
  pos = idx + 1;
}

// 2. Kiểm tra whisper hoặc transcribe trong zip3 main
pos = 0;
while (true) {
  const idx = zip3Main.indexOf('whisper', pos);
  if (idx === -1) break;
  console.log('whisper in zip3 main at', idx);
  console.log(zip3Main.slice(idx - 50, idx + 400));
  pos = idx + 1;
}
