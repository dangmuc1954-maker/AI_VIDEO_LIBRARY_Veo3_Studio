const fs = require('fs');
const path = require('path');

const zip3Main = fs.readFileSync(path.resolve(__dirname, '../scratch/zip3_analysis/extracted_app_files/resources/app/out/main/index.js'), 'utf8');

// Find all occurrences of syncVoiceoverVideo
const syncIdx = zip3Main.indexOf('syncVoiceoverVideo');
console.log('--- syncVoiceoverVideo in zip3 main ---');
if (syncIdx !== -1) {
  console.log(zip3Main.slice(syncIdx - 50, syncIdx + 3000));
}

// Find all occurrences of transcribeVideoAudio
const transIdx = zip3Main.indexOf('transcribeVideoAudio');
console.log('--- transcribeVideoAudio in zip3 main ---');
if (transIdx !== -1) {
  console.log(zip3Main.slice(transIdx - 50, transIdx + 3000));
}
