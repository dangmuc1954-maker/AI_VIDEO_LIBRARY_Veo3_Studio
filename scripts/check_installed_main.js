const fs = require('fs');

const installedMain = 'C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app/out/main/index.js';
const content = fs.readFileSync(installedMain, 'utf8');

const sIdx = content.indexOf('async transcribeVideoAudio(');
console.log('transcribeVideoAudio in installed app:');
console.log(content.slice(sIdx, sIdx + 1200));
