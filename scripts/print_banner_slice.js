const fs = require('fs');
const path = require('path');

const vsPath = path.join(__dirname, '../app/out/renderer/assets/VideoStudio-BZY_1pM8.js');
const code = fs.readFileSync(vsPath, 'utf8');

const bannerSlice = code.slice(
  code.indexOf('e.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-3 border-b border-emerald'),
  code.indexOf('e.jsx("div",{ref:w,className:"max-h-[312px] overflow-auto"')
);

console.log('--- RAW BANNER SLICE ---');
console.log(bannerSlice);
