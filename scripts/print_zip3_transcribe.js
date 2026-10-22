const fs = require('fs');
const zip3Main = fs.readFileSync('scratch/zip3_source_app/resources/app/out/main/index.js', 'utf8');

const startIdx = zip3Main.indexOf('async transcribeVideoAudio(videoAssetId');
const endIdx = zip3Main.indexOf('async mergeAudios', startIdx);
console.log('transcribeVideoAudio length:', endIdx - startIdx);
console.log(zip3Main.slice(startIdx, endIdx));
