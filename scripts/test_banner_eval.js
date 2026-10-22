const fs = require('fs');
const path = require('path');

const p = path.join(__dirname, '../app/out/renderer/assets/VideoStudio-BZY_1pM8.js');
const code = fs.readFileSync(p, 'utf8');

const bannerSlice = code.slice(
  code.indexOf('e.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-3 border-b border-emerald'),
  code.indexOf('e.jsx("div",{ref:w,className:"max-h-[312px] overflow-auto"')
).replace(/,\s*$/, '');

const e = { jsx: () => ({}), jsxs: () => ({}) };
const d = { id: 1, index: 1, tts: { enabled: true } };
const V = () => {};
const G = [];

try {
  eval('(' + bannerSlice + ')');
  console.log('✅ Top Banner is 100% VALID JS expression!');
} catch (err) {
  console.error('❌ Banner error:', err.message);
}

const inspIdx = code.indexOf('e.jsxs("section",{className:"flex flex-col gap-2.5 rounded-lg border border-emerald-500/30');
const inspSlice = code.slice(inspIdx, code.indexOf('e.jsx(It,{asset:_,onClose:()=>V(null)})', inspIdx)).replace(/,\s*$/, '');

const n = { id: 1, index: 1, tts: { enabled: true } };
const R = () => {};

try {
  eval('(' + inspSlice + ')');
  console.log('✅ Inspector Section is 100% VALID JS expression!');
} catch (err) {
  console.error('❌ Inspector Section error:', err.message);
}
