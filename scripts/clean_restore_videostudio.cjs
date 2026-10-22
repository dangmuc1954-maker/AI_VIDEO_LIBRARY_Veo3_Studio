const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const targetRoots = [
  path.join(__dirname, '../app'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Customer_Edition/resources/app'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Khach_Hang_v3.0/resources/app'),
  'C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app'
];

for (const root of targetRoots) {
  const vsPath = path.join(root, 'out/renderer/assets/VideoStudio-frcr8V6s.js');
  if (!fs.existsSync(vsPath)) continue;

  let vsCode = fs.readFileSync(vsPath, 'utf8');

  // Find between autoRemoveWatermark and de=p=>
  const p1 = vsCode.indexOf('autoRemoveWatermark:p==="Grok"||p==="Muse AI"?!1:K.autoRemoveWatermark}),');
  const p2 = vsCode.indexOf('de=p=>{switch(p){case"Completed":', p1);

  if (p1 !== -1 && p2 !== -1) {
    // Restore the comma:
    // autoRemoveWatermark: ... }),de=p=>
    const originalMiddle = 'autoRemoveWatermark:p==="Grok"||p==="Muse AI"?!1:K.autoRemoveWatermark}),';
    vsCode = vsCode.slice(0, p1 + originalMiddle.length) + vsCode.slice(p2);
    console.log('Restored clean ce/de chain in', vsPath);
  }

  // Now insert state right before const ce=(p,K)=>
  const anchor = 'cancelAnimationFrame(p)},[n,Y,m]);';
  const stateCode = `const[autoDlVid,setAutoDlVid]=l.useState(()=>{try{return window.localStorage.getItem("aiforge_auto_download_video")==="true"}catch{return!1}}),[autoDlVidDir,setAutoDlVidDir]=l.useState(()=>{try{return window.localStorage.getItem("aiforge_auto_download_dir")||""}catch{return""}});l.useEffect(()=>{try{window.aivideo?.settings?.setAutoDownloadConfig?.({video:{enabled:autoDlVid,directory:autoDlVidDir}})}catch{}},[autoDlVid,autoDlVidDir]);const onPickVidDir=async()=>{try{const dir=await window.aivideo?.assets?.selectExportDirectory?.(autoDlVidDir||"","Chọn thư mục tự động lưu Video AI");if(dir){setAutoDlVidDir(dir);window.localStorage.setItem("aiforge_auto_download_dir",dir);window.aivideo?.settings?.setAutoDownloadConfig?.({video:{enabled:autoDlVid,directory:dir}})}}catch{}},onToggleVidDl=async()=>{if(!autoDlVid&&!autoDlVidDir){const dir=await window.aivideo?.assets?.selectExportDirectory?.("","Chọn thư mục tự động lưu Video AI");if(dir){setAutoDlVidDir(dir);window.localStorage.setItem("aiforge_auto_download_dir",dir);setAutoDlVid(!0);window.localStorage.setItem("aiforge_auto_download_video","true");window.aivideo?.settings?.setAutoDownloadConfig?.({video:{enabled:!0,directory:dir}});return}}const next=!autoDlVid;setAutoDlVid(next);window.localStorage.setItem("aiforge_auto_download_video",String(next));window.aivideo?.settings?.setAutoDownloadConfig?.({video:{enabled:next,directory:autoDlVidDir}})};`;

  if (vsCode.includes(anchor) && !vsCode.includes('autoDlVid,setAutoDlVid')) {
    vsCode = vsCode.replace(anchor, anchor + stateCode);
    console.log('Inserted clean autoDlVid state before ce in', vsPath);
  }

  fs.writeFileSync(vsPath, vsCode, 'utf8');
  try {
    execSync(`node --check "${vsPath}"`);
    console.log('✅ VideoStudio syntax valid in', vsPath);
  } catch (e) {
    console.error('❌ VideoStudio syntax error:', e.message);
  }
}
