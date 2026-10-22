const fs = require('fs');
const path = require('path');

const curMainPath = path.resolve(__dirname, '../app/out/main/index.js');
const curCode = fs.readFileSync(curMainPath, 'utf8');

const curTransStart = curCode.indexOf('async transcribeVideoAudio(');
console.log(curCode.slice(curTransStart, curTransStart + 1500));
