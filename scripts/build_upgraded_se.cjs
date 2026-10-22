const fs = require('fs');
const path = require('path');
const acorn = require('./obfuscator/node_modules/acorn');

const sfbPath = path.join(__dirname, '../app/out/renderer/assets/StudioFailedBulkActions-Zv2NpUPy.js');
let code = fs.readFileSync(sfbPath, 'utf8');

const sIdx = code.indexOf('function Se(');
const eIdx = code.indexOf('const le={image:', sIdx);

if (sIdx === -1 || eIdx === -1) {
  console.error('❌ Could not locate Se bounds in StudioFailedBulkActions-Zv2NpUPy.js');
  process.exit(1);
}

let se = code.substring(sIdx, eIdx);

// 1. Fix Root Dialog Container: replace unbounded class with strict fixed dimensions and flex column layout
const oldQPattern = 'className:"fixed left-1/2 top-1/2 z-[var(--layer-dialog)] flex h-[min(960px,94vh)] w-[min(1600px,96vw)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-3xl border border-white/15 bg-[#16122d] text-text-primary shadow-[0_32px_90px_rgba(0,0,0,0.85)] outline-none"';
const newQReplacement = 'className:"fixed left-1/2 top-1/2 z-[var(--layer-dialog)] flex -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-white/20 bg-[#16122d] text-text-primary shadow-[0_25px_90px_rgba(0,0,0,0.92)] outline-none",style:{height:"88vh",maxHeight:"88vh",width:"95vw",maxWidth:"1380px",display:"flex",flexDirection:"column",overflow:"hidden"}';

if (!se.includes(oldQPattern)) {
  console.error('❌ Could not find oldQPattern in Se');
  process.exit(1);
}
se = se.replace(oldQPattern, newQReplacement);

// 2. Fix Header and Add Big Prominent Close Button
const oldClose = 'e.jsx(G,{asChild:!0,children:e.jsx("button",{type:"button","aria-label":s("common.close"),className:"flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl p-1 text-slate-400 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a3e635]/50",children:e.jsx(B,{size:19})})})';
const newClose = 'e.jsx("button",{type:"button",onClick:()=>n(!1),"aria-label":"Đóng cửa sổ",title:"Đóng cửa sổ (Esc)",className:"flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3.5 text-xs font-bold text-slate-200 transition-all hover:border-red-500/50 hover:bg-red-500/20 hover:text-white active:scale-95 shadow-sm",children:[e.jsx(B,{size:16,strokeWidth:2.5,className:"text-red-400"}),e.jsx("span",{className:"font-bold",children:"Đóng"})]})';

if (!se.includes(oldClose)) {
  console.error('❌ Could not find oldClose in Se');
  process.exit(1);
}
se = se.replace(oldClose, newClose);

// Also upgrade header height to clean h-14
se = se.replace(
  'className:"flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-gradient-to-r from-[#231d45] via-[#1f193d] to-[#231d45] px-7 backdrop-blur-xl"',
  'className:"flex h-14 shrink-0 items-center justify-between border-b border-white/10 bg-gradient-to-r from-[#241d47] via-[#1f193d] to-[#241d47] px-6 backdrop-blur-xl select-none"'
);

// 3. Grid container (2 columns): enforce strict remaining height
se = se.replace(
  'className:"grid min-h-0 flex-1 grid-cols-1 overflow-hidden md:grid-cols-2"',
  'className:"grid min-h-0 flex-1 grid-cols-1 overflow-hidden md:grid-cols-2",style:{minHeight:0,flex:"1 1 0%",height:"calc(88vh - 112px)"}'
);

// 4. Left column: clean padding & scrolling
se = se.replace(
  'className:"flex min-h-0 flex-col overflow-y-auto border-b border-white/10 bg-[#141028] p-5 md:border-b-0 md:border-r [scrollbar-gutter:stable]"',
  'className:"flex min-h-0 flex-col overflow-y-auto border-b border-white/10 bg-[#141028] p-4 md:border-b-0 md:border-r [scrollbar-gutter:stable]",style:{minHeight:0,overflowY:"auto",height:"100%"}'
);

// 5. Left textarea box: compact height 160px
se = se.replace(
  'className:"relative flex min-h-[160px] h-[220px] shrink-0 flex-col overflow-hidden rounded-xl border border-white/12 bg-[#0e0a20]',
  'className:"relative flex h-[160px] shrink-0 flex-col overflow-hidden rounded-xl border border-white/12 bg-[#0e0a20]'
);

// 6 & 7. Right column container & header: add scroll hint for mouse wheel ("Cuộn chuột xem tiếp (X cảnh)")
const rColTargetStart = se.indexOf('Right Column:');
const rColTargetEnd = se.indexOf('d.length>0?', rColTargetStart);
if (rColTargetStart === -1 || rColTargetEnd === -1) {
  console.error('❌ Could not locate Right Column section in Se');
  process.exit(1);
}

const newRightColumnHeader = `Right Column: Scene Preview List
        e.jsxs("div",{className:"flex min-h-0 flex-col bg-[#1d183d]/95 p-4",style:{minHeight:0,height:"100%",display:"flex",flexDirection:"column",overflow:"hidden"},children:[
          e.jsxs("div",{className:"mb-2.5 flex shrink-0 items-center justify-between gap-2 border-b border-white/10 pb-2 select-none",children:[
            e.jsxs("div",{className:"flex items-center gap-2",children:[
              e.jsx("span",{className:"text-xs font-black tracking-wide uppercase text-slate-100",children:"DANH SÁCH PHÂN CẢNH"}),
              d.length>0&&e.jsxs("span",{className:"inline-flex items-center rounded-full border border-[#a3e635]/45 bg-[#a3e635]/20 px-2.5 py-0.5 text-xs font-black text-[#d9f99d] shadow-[0_0_10px_rgba(163,230,53,0.2)]",children:[d.length," cảnh"]})
            ]}),
            d.length>3&&e.jsxs("div",{className:"flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-white/5 px-2.5 py-0.5 rounded-lg border border-white/8",children:[
              e.jsx("span",{children:"↕ Cuộn chuột xem tiếp ("}),
              e.jsx("span",{className:"font-bold text-[#d9f99d]",children:d.length}),
              e.jsx("span",{children:" cảnh)"})
            ]})
          ]}),
          `;

se = se.substring(0, rColTargetStart) + newRightColumnHeader + se.substring(rColTargetEnd);

// 8. Right column card list: mouse wheel scroll with smooth overflow-y: auto
se = se.replace(
  'className:"flex-1 min-h-0 overflow-y-auto space-y-3 pr-2 [scrollbar-gutter:stable]"',
  'className:"flex-1 min-h-0 overflow-y-auto space-y-2.5 pr-1.5 [scrollbar-gutter:stable]",style:{minHeight:0,flex:"1 1 0%",overflowY:"auto",maxHeight:"100%"}'
);

// 9. Footer: clean h-14 height
se = se.replace(
  'className:"flex h-16 shrink-0 items-center justify-between border-t border-white/10 bg-gradient-to-r from-[#231d45] via-[#1f193d] to-[#231d45] px-7 backdrop-blur-xl"',
  'className:"flex h-14 shrink-0 items-center justify-between border-t border-white/10 bg-gradient-to-r from-[#241d47] via-[#1f193d] to-[#241d47] px-6 backdrop-blur-xl select-none"'
);

// Verify with Acorn
console.log('Validating modified Se with Acorn...');
try {
  acorn.parse(se, { ecmaVersion: 'latest', sourceType: 'module' });
  console.log('✓ Modified Se is 100% syntactically valid JS!');
} catch (err) {
  console.error('❌ Syntax error in modified Se:', err.message);
  process.exit(1);
}

// Assemble full code
code = code.substring(0, sIdx) + se + code.substring(eIdx);

// Also validate full code with Acorn
console.log('Validating full StudioFailedBulkActions bundle with Acorn...');
try {
  acorn.parse(code, { ecmaVersion: 'latest', sourceType: 'module' });
  console.log('✓ Entire file is 100% syntactically valid JS!');
} catch (err) {
  console.error('❌ Syntax error in full file:', err.message);
  process.exit(1);
}

fs.writeFileSync(sfbPath, code, 'utf8');
console.log('✓ Successfully written to ' + sfbPath);
