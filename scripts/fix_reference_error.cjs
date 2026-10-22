const fs = require('fs');
const path = require('path');

const vsPath = path.join(__dirname, '../app/out/renderer/assets/VideoStudio-frcr8V6s.js');
let code = fs.readFileSync(vsPath, 'utf8');

// 1. Remove the misplaced hook from top of ua()
const badHook = 'l.useEffect(()=>{n()},[n]);l.useEffect(()=>{window.__openAiforgeVideoEditorModal=(assetIds=[])=>{let targetIds=Array.isArray(assetIds)&&assetIds.length>0?assetIds:[];if(targetIds.length===0){if(k&&k.size>0){targetIds=ue.filter(v=>k.has(v.id)).map(v=>v.asset?.assetId||v.asset?.id).filter(Boolean);}if(!targetIds||targetIds.length===0){targetIds=ue.filter(v=>v.status==="Completed").map(v=>v.asset?.assetId||v.asset?.id).filter(Boolean);}}if(targetIds&&targetIds.length>0&&typeof J.getState==="function"&&J.getState().openMergeModalWithAssets){J.getState().openMergeModalWithAssets(targetIds);}else{se(!0);}};window.aiforgeVideoEditor={open:(ids)=>window.__openAiforgeVideoEditorModal(ids)};return()=>{window.__openAiforgeVideoEditorModal=null;};},[k,ue,se]);';

if (code.includes(badHook)) {
  code = code.replace(badHook, 'l.useEffect(()=>{n()},[n]);');
  console.log('✓ Successfully removed bad hook from top of ua()');
} else {
  console.log('Bad hook string not found directly, searching regex...');
  const m = code.indexOf('l.useEffect(()=>{window.__openAiforgeVideoEditorModal=');
  if (m !== -1) {
    const end = code.indexOf('},[k,ue,se]);', m);
    if (end !== -1) {
      code = code.substring(0, m) + code.substring(end + '},[k,ue,se]);'.length);
      console.log('✓ Removed hook by slice indices');
    }
  }
}

// 2. Insert the hook at the end of ua(), right before `return e.jsx(br,`
const retTarget = 'return e.jsx(br,{children:e.jsxs(Cr,';
if (!code.includes(retTarget)) {
  console.error('❌ Could not find retTarget in VideoStudio');
  process.exit(1);
}

const safeHook = `l.useEffect(()=>{window.__openAiforgeVideoEditorModal=(assetIds=[])=>{let targetIds=Array.isArray(assetIds)&&assetIds.length>0?assetIds:[];if(targetIds.length===0){if(k&&k.size>0&&Array.isArray(ue)){targetIds=ue.filter(v=>k.has(v.id)).map(v=>v.asset?.assetId||v.asset?.id).filter(Boolean);}if(!targetIds||targetIds.length===0){if(Array.isArray(ue)){targetIds=ue.filter(v=>v.status==="Completed").map(v=>v.asset?.assetId||v.asset?.id).filter(Boolean);}}}if(targetIds&&targetIds.length>0&&typeof J.getState==="function"&&J.getState().openMergeModalWithAssets){J.getState().openMergeModalWithAssets(targetIds);}else{se(!0);}};window.aiforgeVideoEditor={open:(ids)=>window.__openAiforgeVideoEditorModal(ids)};return()=>{window.__openAiforgeVideoEditorModal=null;};},[k,ue,se]);`;

code = code.replace(retTarget, safeHook + retTarget);
console.log('✓ Injected safeHook at end of ua() where all variables are already declared and initialized!');

fs.writeFileSync(vsPath, code, 'utf8');
console.log('✓ Saved updated VideoStudio-frcr8V6s.js');
