const fs = require('fs');
const path = require('path');

console.log('=== Step 1: Patching WorkflowEditor-LHGC9K3C.js ===');
const wfPath = path.resolve(__dirname, '../app/out/renderer/assets/WorkflowEditor-LHGC9K3C.js');
let wfCode = fs.readFileSync(wfPath, 'utf8');

// Replace the custom alert onClick in "Nhận diện lại" and "Bóc kịch bản ngay" with native P(e.id)
const oldSnippet = `onClick:async fe=>{fe.stopPropagation();try{const C=window.aiforge?.assets;const allAssets=await C?.list?.();const lastVid=allAssets?.filter?.(a=>a.type==="video")?.slice(-1)[0];if(!lastVid)return alert("Chưa có video nào để bóc kịch bản!");fe.target.innerText="⏳ Đang lắng nghe...";const res=await C?.transcribeVideoAudio?.(lastVid.id);if(res?.script){h?.(e.id,{...e.config,outputText:res.script,duration:res.duration})}}catch(err){alert("Lỗi bóc kịch bản: "+(err.message||err))}finally{fe.target.innerText="▶ Bóc kịch bản ngay"}}`;

const oldRetrySnippet = `onClick:async fe=>{fe.stopPropagation();try{const C=window.aiforge?.assets;const allAssets=await C?.list?.();const lastVid=allAssets?.filter?.(a=>a.type==="video")?.slice(-1)[0];if(!lastVid)return alert("Chưa có video nào để bóc kịch bản!");const res=await C?.transcribeVideoAudio?.(lastVid.id);if(res?.script){h?.(e.id,{...e.config,outputText:res.script,duration:res.duration})}}catch(err){alert("Lỗi bóc kịch bản: "+(err.message||err))}}`;

if (wfCode.includes(oldSnippet)) {
  wfCode = wfCode.replace(oldSnippet, 'onClick:fe=>{fe.stopPropagation(),P(e.id)}');
  console.log('  ✓ Patched "Bóc kịch bản ngay" button to P(e.id)');
} else {
  console.log('  Notice: oldSnippet not found, checking alternative pattern...');
}

if (wfCode.includes(oldRetrySnippet)) {
  wfCode = wfCode.replace(oldRetrySnippet, 'onClick:fe=>{fe.stopPropagation(),P(e.id)}');
  console.log('  ✓ Patched "Nhận diện lại" button to P(e.id)');
}

fs.writeFileSync(wfPath, wfCode, 'utf8');
console.log('✅ WorkflowEditor patched successfully!');
