const fs = require('fs');
const path = require('path');

const wfPath = path.resolve(__dirname, '../app/out/renderer/assets/WorkflowEditor-LHGC9K3C.js');
let wfCode = fs.readFileSync(wfPath, 'utf8');

const targetStr = `e.type==="video-script-extract"&&t.jsxs("div",{className:"flex-1 flex flex-col gap-2 p-2 bg-[#130f2440] border border-white/5 rounded-lg min-h-0 overflow-y-auto scrollbar-thin text-left select-none",children:[t.jsxs("div",{className:"text-[11px] text-text-muted flex justify-between items-center",children:[t.jsx("span",{children:"Tác vụ:"}),t.jsx("span",{className:"font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 text-[10px]",children:"Âm thanh → Văn bản"})]}),e.config?.outputText?`;

const replacementStr = `e.type==="video-script-extract"&&t.jsxs("div",{className:"flex-1 flex flex-col gap-2 p-2 bg-[#130f2440] border border-white/5 rounded-lg min-h-0 overflow-y-auto scrollbar-thin text-left select-none",children:[t.jsxs("div",{className:"text-[11px] text-text-muted flex justify-between items-center",children:[t.jsx("span",{children:"Tác vụ:"}),t.jsx("span",{className:"font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 text-[10px]",children:"Âm thanh → Văn bản"})]}),(e.status==="running"||re)?t.jsxs("div",{className:"flex-1 rounded-lg border border-emerald-500/30 bg-[#062c25]/40 flex flex-col items-center justify-center gap-2 py-4 text-emerald-300 select-none",children:[t.jsx("div",{className:"w-6 h-6 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin"}),t.jsxs("span",{className:"text-xs font-bold animate-pulse text-emerald-300",children:[e.statusText||"Đang lắng nghe âm thanh video..."," ",(e.progress||30),"%"]}),t.jsx("span",{className:"text-[10px] text-emerald-400/80 italic",children:"AI đang chuyển âm thanh sang văn bản..."})]}):e.config?.outputText?`;

if (wfCode.includes(targetStr)) {
  wfCode = wfCode.replace(targetStr, replacementStr);
  fs.writeFileSync(wfPath, wfCode, 'utf8');
  console.log('✅ Added gorgeous Loading Spinner & Status to video-script-extract node card!');
} else {
  console.error('❌ targetStr not found in WorkflowEditor-LHGC9K3C.js');
}
