const fs = require('fs');
const path = require('path');

const vsPath = path.join(__dirname, '../app/out/renderer/assets/VideoStudio-frcr8V6s.js');
let code = fs.readFileSync(vsPath, 'utf8');

console.log('Original VideoStudio size:', code.length);

// 1. Remove "Ghép tự động" and "Biên tập video" from the top bar (header actions)
// In ua():
// actions:e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsxs("button",{type:"button",role:"switch","aria-checked":f...children:[e.jsx(Ue,{size:12,className:"stroke-[2.2]"}),e.jsx("span",{children:t("videoStudio.openMergeModalButton")})]}),e.jsx("div",{className:"h-4 w-px bg-border-primary/80"}),

const actionsStart = 'actions:e.jsxs("div",{className:"flex items-center gap-3",children:[';
const dividerStr = 'e.jsx("div",{className:"h-4 w-px bg-border-primary/80"}),';

const startIdx = code.indexOf(actionsStart);
if (startIdx === -1) {
  console.error('❌ Could not find actionsStart in VideoStudio');
  process.exit(1);
}

const divIdx = code.indexOf(dividerStr, startIdx);
if (divIdx === -1) {
  console.error('❌ Could not find dividerStr in VideoStudio');
  process.exit(1);
}

const removedChunk = code.substring(startIdx + actionsStart.length, divIdx + dividerStr.length);
console.log('Found chunk to remove from top bar (length ' + removedChunk.length + '):');
console.log(removedChunk.substring(0, 120) + ' ... ' + removedChunk.substring(removedChunk.length - 80));

// Replace in code
code = code.substring(0, startIdx + actionsStart.length) + code.substring(divIdx + dividerStr.length);
console.log('✓ Successfully removed "Ghép tự động" and "Biên tập video" from top bar!');

// 2. Add window.__openAiforgeVideoEditorModal hook in ua()
// Look for `l.useEffect(()=>{n()},[n]);`
const hookTarget = 'l.useEffect(()=>{n()},[n]);';
if (!code.includes(hookTarget)) {
  console.error('❌ Could not find hookTarget in VideoStudio');
  process.exit(1);
}

const globalEditorHook = `l.useEffect(()=>{n()},[n]);l.useEffect(()=>{window.__openAiforgeVideoEditorModal=(assetIds=[])=>{let targetIds=Array.isArray(assetIds)&&assetIds.length>0?assetIds:[];if(targetIds.length===0){if(k&&k.size>0){targetIds=ue.filter(v=>k.has(v.id)).map(v=>v.asset?.assetId||v.asset?.id).filter(Boolean);}if(!targetIds||targetIds.length===0){targetIds=ue.filter(v=>v.status==="Completed").map(v=>v.asset?.assetId||v.asset?.id).filter(Boolean);}}if(targetIds&&targetIds.length>0&&typeof J.getState==="function"&&J.getState().openMergeModalWithAssets){J.getState().openMergeModalWithAssets(targetIds);}else{se(!0);}};window.aiforgeVideoEditor={open:(ids)=>window.__openAiforgeVideoEditorModal(ids)};return()=>{window.__openAiforgeVideoEditorModal=null;};},[k,ue,se]);`;

code = code.replace(hookTarget, globalEditorHook);
console.log('✓ Injected window.__openAiforgeVideoEditorModal hook in ua()');

// 3. Add "Biên tập video" button to Video Queue toolbar in mn()
// Look for the toolbar start in mn():
const queueToolbarTarget = 'e.jsxs("div",{className:"flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2.5 text-xs text-text-muted",children:[';

if (!code.includes(queueToolbarTarget)) {
  console.error('❌ Could not find queueToolbarTarget in VideoStudio');
  process.exit(1);
}

const editorBtnInQueue = `e.jsxs("button",{type:"button","aria-label":P("videoStudio.openMergeModalButton"),title:"Mở phòng dựng và ghép video",onClick:()=>{if(typeof window.__openAiforgeVideoEditorModal==="function"){window.__openAiforgeVideoEditorModal();}else if(typeof J.getState==="function"&&J.getState().setIsMergeModalOpen){J.getState().setIsMergeModalOpen(true);}},className:"inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-3 text-xs font-semibold text-white shadow-[0_2px_12px_rgba(79,70,229,0.35)] transition-all hover:scale-[1.02] hover:from-indigo-500 hover:to-violet-500 hover:shadow-[0_4px_18px_rgba(79,70,229,0.55)] active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500/50",children:[e.jsx(Ue,{size:14,className:"stroke-[2.2]"}),e.jsx("span",{children:P("videoStudio.openMergeModalButton")})]}),`;

code = code.replace(queueToolbarTarget, queueToolbarTarget + editorBtnInQueue);
console.log('✓ Injected native "Biên tập video" button into Video Queue toolbar in mn()');

// Backup and save
fs.writeFileSync(vsPath + '.bak_before_merge_clean', fs.readFileSync(vsPath, 'utf8'), 'utf8');
fs.writeFileSync(vsPath, code, 'utf8');
console.log('✓ Successfully updated VideoStudio-frcr8V6s.js! New size:', code.length);
