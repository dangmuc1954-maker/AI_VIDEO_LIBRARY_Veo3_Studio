const fs = require('fs');
const path = require('path');

const curMainPath = path.resolve(__dirname, '../app/out/main/index.js');
const curCode = fs.readFileSync(curMainPath, 'utf8');

const ipcIdx = curCode.indexOf('assets:transcribeVideoAudio');
console.log('IPC handler index:', ipcIdx);
if (ipcIdx !== -1) {
  console.log(curCode.slice(ipcIdx - 100, ipcIdx + 400));
}
