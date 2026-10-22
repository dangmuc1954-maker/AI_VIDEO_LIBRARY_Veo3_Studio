const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== PATCHING VIDEOSTUDIO DIRECTLY WITH AUTO-MERGE & VIDEO EDITOR ===');

const vsPath = path.join(__dirname, '../app/out/renderer/assets/VideoStudio-BZY_1pM8.js');
let code = fs.readFileSync(vsPath, 'utf8');

// 1. Check if ln exists
const lnHeader = 'function ln({accountOptions:t,allRowsSelected:o,focusPromptId:s,promptBottomSpacerHeight:i,promptCount:n,promptTopSpacerHeight:a,renderedRows:c,selectedPrompt:d,selectedRows:g,searchQuery:k,totalVideos:$,visibleRows:G,onActivatePromptRow:D,onAddPrompt:E,onDuplicatePrompt:C,onRemovePrompt:z,onSearchChange:A,onScroll:R,onToggleAllRows:T,onToggleRow:_,onUpdatePrompt:V}){';

if (!code.includes(lnHeader)) {
  console.error('❌ Could not find lnHeader in VideoStudio!');
  process.exit(1);
}

// 2. Inject autoMergeOn state into ln
const lnStateInject = 'const [autoMergeOn, setAutoMergeOn] = h.useState(() => { try { return localStorage.getItem("aiforge_auto_merge_enabled") !== "false"; } catch (_) { return true; } });';

if (!code.includes('const [autoMergeOn, setAutoMergeOn]')) {
  code = code.replace(lnHeader, lnHeader + lnStateInject);
  console.log('✓ Injected autoMergeOn state into function ln');
}

// 3. Find the toolbar container in ln
const targetToolbar = 'e.jsxs("div",{className:"flex min-w-0 flex-wrap items-center justify-end gap-2 text-xs text-text-muted",children:[';

const buttonsJsx = `e.jsxs("button",{type:"button",role:"switch","aria-checked":autoMergeOn,title:autoMergeOn?"Tự động ghép: ĐANG BẬT (Tự động ghép nối các video clip thành phẩm theo đúng thứ tự prompt)":"Tự động ghép: ĐANG TẮT (Bấm để bật tự động ghép video khi hoàn tất)",onClick:()=>{const next=!autoMergeOn;setAutoMergeOn(next);try{localStorage.setItem("aiforge_auto_merge_enabled",next?"true":"false");}catch(_){}if(window.aiforgeVideoEditor?.setAutoMerge)window.aiforgeVideoEditor.setAutoMerge(next);},className:"group inline-flex h-7 min-w-max shrink-0 cursor-pointer select-none items-center gap-1.5 whitespace-nowrap rounded-md border px-2.5 text-xs font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-sky-400/45 "+(autoMergeOn?"border-sky-400/50 bg-sky-500/15 text-sky-200 shadow-[0_0_12px_rgba(14,165,233,0.25)]":"border-white/10 bg-white/[0.04] text-slate-400 hover:text-slate-200"),children:[e.jsx("span",{children:"🔗"}),e.jsx("span",{children:"Tự động ghép"}),e.jsx("span",{"aria-hidden":"true",className:"relative h-4 w-7 shrink-0 overflow-hidden rounded-full border transition-colors "+(autoMergeOn?"border-sky-400/60 bg-sky-500":"border-white/10 bg-slate-700"),children:e.jsx("span",{className:"absolute left-0.5 top-0.5 h-2.5 w-2.5 rounded-full bg-white shadow-sm transition-transform "+(autoMergeOn?"translate-x-3":"translate-x-0")})})]}),e.jsxs("button",{type:"button",title:"Mở trình biên tập & ghép video hoàn chỉnh (MiniVideoEditorModal - BIÊN TẬP & GHÉP VIDEO HOÀN CHỈNH)",onClick:()=>{if(window.aiforgeVideoEditor?.open){window.aiforgeVideoEditor.open();}else{alert("Đang khởi tạo trình biên tập video...");}},className:"inline-flex h-7 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md bg-gradient-to-r from-indigo-600 to-violet-600 px-3 text-xs font-semibold text-white shadow-[0_2px_12px_rgba(79,70,229,0.35)] transition-all hover:scale-[1.02] hover:from-indigo-500 hover:to-violet-500 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500/50",children:[e.jsx("span",{children:"🎬"}),e.jsx("span",{children:"Biên tập video"})]}),`;

if (code.includes(targetToolbar) && !code.includes('MiniVideoEditorModal')) {
  code = code.replace(targetToolbar, targetToolbar + buttonsJsx);
  console.log('✓ Injected Auto-Merge switch and Video Editor button into Video Queue toolbar');
}

fs.writeFileSync(vsPath, code, 'utf8');

// Also update extracted_original and dist targets if they exist
const otherTargets = [
  path.join(__dirname, '../extracted_original/out/renderer/assets/VideoStudio-BZY_1pM8.js'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Customer_Edition/resources/app/out/renderer/assets/VideoStudio-BZY_1pM8.js'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Khach_Hang_v3.0/resources/app/out/renderer/assets/VideoStudio-BZY_1pM8.js'),
  'C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app/out/renderer/assets/VideoStudio-BZY_1pM8.js'
];

for (const t of otherTargets) {
  if (fs.existsSync(t)) {
    fs.writeFileSync(t, code, 'utf8');
    console.log('✓ Updated target:', t);
  }
}

// 4. Validate syntax
try {
  execSync('node --check "' + vsPath + '"', { stdio: 'inherit' });
  console.log('✅ Syntax is 100% VALID in VideoStudio-BZY_1pM8.js!');
} catch (e) {
  console.error('❌ Syntax error:', e.message);
  process.exit(1);
}
