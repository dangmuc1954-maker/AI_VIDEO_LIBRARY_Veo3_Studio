const fs = require('fs');
const path = require('path');

const zip3Preload = fs.readFileSync(path.resolve(__dirname, '../scratch/zip3_analysis/extracted_app_files/resources/app/out/preload/index.js'), 'utf8');
const curPreload = fs.readFileSync(path.resolve(__dirname, '../app/out/preload/index.js'), 'utf8');

console.log('Zip3 preload has transcribeVideoAudio:', zip3Preload.includes('transcribeVideoAudio'));
console.log('Cur preload has transcribeVideoAudio:', curPreload.includes('transcribeVideoAudio'));
console.log('Zip3 preload has syncVoiceoverVideo:', zip3Preload.includes('syncVoiceoverVideo'));
console.log('Cur preload has syncVoiceoverVideo:', curPreload.includes('syncVoiceoverVideo'));
