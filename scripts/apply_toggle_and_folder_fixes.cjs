const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');

// 1. UPDATE ImageStudio-4nmpUX3j.js
const isPath = path.join(rootDir, 'app/out/renderer/assets/ImageStudio-4nmpUX3j.js');
if (fs.existsSync(isPath)) {
  let isCode = fs.readFileSync(isPath, 'utf8');

  // Replace aiforge_auto_download_dir with aiforge_auto_download_image_dir
  isCode = isCode.replaceAll('"aiforge_auto_download_dir"', '"aiforge_auto_download_image_dir"');

  // Ensure onPickDir sets folder AND turns ON autoDl immediately
  const pPick = isCode.indexOf('onPickDir=');
  const pPickEnd = isCode.indexOf('onToggleDl=', pPick);
  if (pPick !== -1 && pPickEnd !== -1) {
    const newPickDir = 'onPickDir=async()=>{try{const dir=await window.aivideo?.assets?.selectExportDirectory?.(autoDlDir||"","Chọn thư mục tự động lưu Ảnh AI");if(dir){setAutoDlDir(dir);setAutoDl(!0);try{window.localStorage.setItem("aiforge_auto_download_image_dir",dir);window.localStorage.setItem("aiforge_auto_download_image","true");}catch(_){};window.aivideo?.settings?.setAutoDownloadConfig?.({image:{enabled:!0,directory:dir}})}}catch(_){}},';
    isCode = isCode.slice(0, pPick) + newPickDir + isCode.slice(pPickEnd);
    console.log('✓ Updated onPickDir in ImageStudio');
  }

  // Ensure onToggleDl checks existing folder and toggles cleanly
  const pTog = isCode.indexOf('onToggleDl=');
  const pTogEnd = isCode.indexOf(',Z=s?', pTog);
  if (pTog !== -1 && pTogEnd !== -1) {
    const newToggleDl = 'onToggleDl=async()=>{let curDir=autoDlDir;if(!curDir){try{curDir=window.localStorage.getItem("aiforge_auto_download_image_dir")||"";}catch(_){};if(curDir)setAutoDlDir(curDir)}if(!autoDl&&!curDir){const dir=await window.aivideo?.assets?.selectExportDirectory?.("","Chọn thư mục tự động lưu Ảnh AI");if(dir){curDir=dir;setAutoDlDir(dir);try{window.localStorage.setItem("aiforge_auto_download_image_dir",dir);}catch(_){}}else{return;}}const next=!autoDl;setAutoDl(next);try{window.localStorage.setItem("aiforge_auto_download_image",String(next));}catch(_){};window.aivideo?.settings?.setAutoDownloadConfig?.({image:{enabled:next,directory:curDir}})}';
    isCode = isCode.slice(0, pTog) + newToggleDl + isCode.slice(pTogEnd);
    console.log('✓ Updated onToggleDl in ImageStudio');
  }

  fs.writeFileSync(isPath, isCode, 'utf8');
}

// 2. UPDATE VideoStudio-frcr8V6s.js
const vsPath = path.join(rootDir, 'app/out/renderer/assets/VideoStudio-frcr8V6s.js');
if (fs.existsSync(vsPath)) {
  let vsCode = fs.readFileSync(vsPath, 'utf8');

  // Replace aiforge_auto_download_dir with aiforge_auto_download_video_dir
  vsCode = vsCode.replaceAll('"aiforge_auto_download_dir"', '"aiforge_auto_download_video_dir"');

  // Ensure onPickVidDir sets folder AND turns ON autoDlVid immediately
  const pPickVid = vsCode.indexOf('onPickVidDir=');
  const pPickVidEnd = vsCode.indexOf('onToggleVidDl=', pPickVid);
  if (pPickVid !== -1 && pPickVidEnd !== -1) {
    const newPickVidDir = 'onPickVidDir=async()=>{try{const dir=await window.aivideo?.assets?.selectExportDirectory?.(autoDlVidDir||"","Chọn thư mục tự động lưu Video AI");if(dir){setAutoDlVidDir(dir);setAutoDlVid(!0);try{window.localStorage.setItem("aiforge_auto_download_video_dir",dir);window.localStorage.setItem("aiforge_auto_download_video","true");}catch(_){};window.aivideo?.settings?.setAutoDownloadConfig?.({video:{enabled:!0,directory:dir},autoMerge:{enabled:autoMergeVid,transition:autoMergeTransition,directory:dir}})}}catch(_){}},';
    vsCode = vsCode.slice(0, pPickVid) + newPickVidDir + vsCode.slice(pPickVidEnd);
    console.log('✓ Updated onPickVidDir in VideoStudio');
  }

  // Ensure onToggleVidDl checks existing folder and toggles cleanly
  const pTogVid = vsCode.indexOf('onToggleVidDl=');
  const pTogVidEnd = vsCode.indexOf(';const ce', pTogVid);
  if (pTogVid !== -1 && pTogVidEnd !== -1) {
    const newToggleVidDl = 'onToggleVidDl=async()=>{let curDir=autoDlVidDir;if(!curDir){try{curDir=window.localStorage.getItem("aiforge_auto_download_video_dir")||window.localStorage.getItem("aiforge_auto_download_dir")||"";}catch(_){};if(curDir)setAutoDlVidDir(curDir)}if(!autoDlVid&&!curDir){const dir=await window.aivideo?.assets?.selectExportDirectory?.("","Chọn thư mục tự động lưu Video AI");if(dir){curDir=dir;setAutoDlVidDir(dir);try{window.localStorage.setItem("aiforge_auto_download_video_dir",dir);}catch(_){}}else{return;}}const next=!autoDlVid;setAutoDlVid(next);try{window.localStorage.setItem("aiforge_auto_download_video",String(next));}catch(_){};window.aivideo?.settings?.setAutoDownloadConfig?.({video:{enabled:next,directory:curDir},autoMerge:{enabled:autoMergeVid,transition:autoMergeTransition,directory:curDir}})}';
    vsCode = vsCode.slice(0, pTogVid) + newToggleVidDl + vsCode.slice(pTogVidEnd);
    console.log('✓ Updated onToggleVidDl in VideoStudio');
  }

  // Ensure onToggleAutoMerge checks existing folder and toggles cleanly
  const pAutoM = vsCode.indexOf('onToggleAutoMerge=async');
  const pAutoMEnd = vsCode.indexOf(';const onChangeAutoMergeTr=', pAutoM);
  if (pAutoM !== -1 && pAutoMEnd !== -1) {
    const newAutoMerge = 'onToggleAutoMerge=async()=>{let currentDir=autoDlVidDir;if(!currentDir){try{currentDir=window.localStorage.getItem("aiforge_auto_download_video_dir")||window.localStorage.getItem("aiforge_auto_download_dir")||"";}catch(_){};if(currentDir)setAutoDlVidDir(currentDir)}if(!autoMergeVid&&!currentDir){const dir=await window.aivideo?.assets?.selectExportDirectory?.("","Chọn thư mục lưu Video Hoàn Chỉnh sau khi ghép");if(dir){currentDir=dir;setAutoDlVidDir(dir);try{window.localStorage.setItem("aiforge_auto_download_video_dir",dir);}catch(_){}}else{return;}}const next=!autoMergeVid;setAutoMergeVid(next);try{window.localStorage.setItem("aiforge_auto_merge_queue_enabled",String(next));window.localStorage.setItem("aiforge.videoStudio.autoMerge.v1",String(next));window.localStorage.setItem("aiforge_auto_merge_enabled",String(next));if(typeof J.getState==="function"&&J.getState().setIsAutoMergeEnabled){J.getState().setIsAutoMergeEnabled(next);}if(window.aiforgeVideoEditor?.setAutoMerge){window.aiforgeVideoEditor.setAutoMerge(next);}window.aivideo?.settings?.setAutoDownloadConfig?.({video:{enabled:autoDlVid,directory:currentDir},autoMerge:{enabled:next,transition:autoMergeTransition,directory:currentDir}});}catch(_){}}';
    vsCode = vsCode.slice(0, pAutoM) + newAutoMerge + vsCode.slice(pAutoMEnd);
    console.log('✓ Updated onToggleAutoMerge in VideoStudio');
  }

  fs.writeFileSync(vsPath, vsCode, 'utf8');
}

// 3. SYNTAX CHECK
console.log('[*] Validating syntax with node --check...');
execSync(`node --check "${isPath}"`, { stdio: 'inherit' });
console.log('  🎉 ImageStudio syntax: OK');
execSync(`node --check "${vsPath}"`, { stdio: 'inherit' });
console.log('  🎉 VideoStudio syntax: OK');
