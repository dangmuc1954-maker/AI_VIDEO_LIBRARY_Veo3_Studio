const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const vsPath = path.join(__dirname, '../app/out/renderer/assets/VideoStudio-frcr8V6s.js');
let code = fs.readFileSync(vsPath, 'utf8');

// 1. Inspect To() in VideoStudio
const pTo = code.indexOf('const To=()=>{');
console.log('To at:', pTo);
if (pTo !== -1) {
  const pToEnd = code.indexOf('y(!0)}', pTo);
  console.log('Current To slice:', code.slice(pTo, pToEnd + 6));
}

// 2. Inspect onPickExportModalDir in VideoStudio
const pPick = code.indexOf('onPickExportModalDir=');
console.log('onPickExportModalDir at:', pPick);
if (pPick !== -1) {
  const pPickEnd = code.indexOf(',eo=async', pPick);
  console.log('Current onPickExportModalDir slice:', code.slice(pPick, pPickEnd));
}

// 3. Inspect Io() in VideoStudio
const pIo = code.indexOf('Io=async()=>{');
console.log('Io at:', pIo);
if (pIo !== -1) {
  const pIoEnd = code.indexOf('finally{me(!1)}}', pIo);
  console.log('Current Io slice (end):', code.slice(pIoEnd - 100, pIoEnd + 16));
}
