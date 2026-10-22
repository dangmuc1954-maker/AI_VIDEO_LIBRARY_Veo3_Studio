const fs = require('fs');
const path = require('path');

const vsPath = path.join(__dirname, '../app/out/renderer/assets/VideoStudio-BZY_1pM8.js');
const code = fs.readFileSync(vsPath, 'utf8');

// Let's test the Top Banner independently:
const testBanner = `
const e = { jsx: () => {}, jsxs: () => {} };
const d = { id: 1, index: 1, tts: { enabled: true } };
const V = () => {};
const G = [];
const banner = ${code.slice(code.indexOf('e.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-3 border-b border-emerald'), code.indexOf('e.jsx("div",{ref:w,className:"max-h-[312px] overflow-auto"'))};
`;

try {
  eval(testBanner);
  console.log('✅ Top Banner is 100% valid JS syntax!');
} catch (err) {
  console.error('❌ Top Banner Error:', err.message);
  console.error(err.stack);
}

// Let's test the Inspector Section independently:
const inspIdx = code.indexOf('e.jsxs("section",{className:"flex flex-col gap-2.5 rounded-lg border border-emerald-500/30');
if (inspIdx !== -1) {
  // Find where it ends
  const inspEnd = code.indexOf('e.jsx(It,{asset:_,onClose:()=>V(null)})', inspIdx);
  const testInsp = `
  const e = { jsx: () => {}, jsxs: () => {} };
  const n = { id: 1, index: 1, tts: { enabled: true } };
  const R = () => {};
  const section = ${code.slice(inspIdx, inspEnd)};
  `;
  try {
    eval(testInsp);
    console.log('✅ Inspector Section is 100% valid JS syntax!');
  } catch (err) {
    console.error('❌ Inspector Section Error:', err.message);
    console.error(err.stack);
  }
}
