const fs = require('fs');
const path = require('path');

const curMainPath = path.resolve(__dirname, '../app/out/main/index.js');
const curCode = fs.readFileSync(curMainPath, 'utf8');

const curTransStart = curCode.indexOf('async transcribeVideoAudio(');
const curTransEnd = curCode.indexOf('async editAndMergeVideos(', curTransStart);

console.log(curCode.slice(curTransStart, curTransEnd));
