const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const vsPath = path.join(rootDir, 'app/out/renderer/assets/VideoStudio-frcr8V6s.js');
let code = fs.readFileSync(vsPath, 'utf8');

// 1. Enhance To() to pre-fill from multiple sources
const oldTo = '(()=>{try{setExportSaveDir(window.localStorage.getItem("aiforge_auto_download_video_dir")||"")}catch(_){}})(),y(!0)}';
const newTo = '(()=>{try{const d=window.localStorage.getItem("aiforge_auto_download_video_dir")||window.localStorage.getItem("aiforge_auto_download_dir")||autoDlVidDir||"";setExportSaveDir(d)}catch(_){}})(),y(!0)}';
if (code.includes(oldTo)) {
  code = code.replace(oldTo, newTo);
  console.log('✓ Enhanced To() in VideoStudio');
} else {
  console.log('! oldTo not found');
}

// 2. Enhance onPickExportModalDir
const oldPick = 'onPickExportModalDir=async()=>{try{const dir=await(window.aivideo?.assets?.selectExportDirectory?.(exportSaveDir||"","Chọn thư mục lưu Video sau khi xuất")||window.aiforge?.assets?.selectExportDirectory?.(exportSaveDir||"","Chọn thư mục lưu Video sau khi xuất"));if(dir){setExportSaveDir(dir);try{window.localStorage.setItem("aiforge_auto_download_video_dir",dir);window.aivideo?.settings?.setAutoDownloadConfig?.({video:{directory:dir}})}catch(_){}}}catch(_){}}';
const newPick = 'onPickExportModalDir=async()=>{try{const dir=await(window.aivideo?.assets?.selectExportDirectory?.(exportSaveDir||autoDlVidDir||"","Chọn thư mục lưu Video sau khi xuất")||window.aiforge?.assets?.selectExportDirectory?.(exportSaveDir||autoDlVidDir||"","Chọn thư mục lưu Video sau khi xuất"));if(dir){setExportSaveDir(dir);try{setAutoDlVidDir(dir);window.localStorage.setItem("aiforge_auto_download_video_dir",dir);window.localStorage.setItem("aiforge_auto_download_dir",dir);window.aivideo?.settings?.setAutoDownloadConfig?.({video:{directory:dir},autoMerge:{directory:dir}})}catch(_){}}}catch(_){}}';
if (code.includes(oldPick)) {
  code = code.replace(oldPick, newPick);
  console.log('✓ Enhanced onPickExportModalDir in VideoStudio');
} else {
  console.log('! oldPick not found');
}

// 3. Enhance Io() to set G(d?.localPath || null) and use robust curExpDir
const oldIoG = 'duration:h.duration}),G(null),z.success(u("videoStudio.mergeSuccessNotification"))';
const newIoG = 'duration:h.duration}),G(d?.localPath||null),z.success(u("videoStudio.mergeSuccessNotification"))';
if (code.includes(oldIoG)) {
  code = code.replace(oldIoG, newIoG);
  console.log('✓ Enhanced Io() G(d?.localPath) in VideoStudio');
} else {
  console.log('! oldIoG not found');
}

// 4. Enhance so() to open folder using ge || N?.localPath
const oldSo = 'so=async()=>{if(ge)try{if(!await window.aiforge?.assets?.showPathInFolder(ge))throw new Error(u("videoStudio.exportDestinationUnavailable"));z.success(u("videoStudio.videoFolderOpened"))}catch(i){z.error(i instanceof Error?i.message:u("common.error"))}}';
const newSo = 'so=async()=>{const p=ge||N?.localPath;if(p)try{if(!await window.aiforge?.assets?.showPathInFolder(p))throw new Error(u("videoStudio.exportDestinationUnavailable"));z.success(u("videoStudio.videoFolderOpened"))}catch(i){z.error(i instanceof Error?i.message:u("common.error"))}}';
if (code.includes(oldSo)) {
  code = code.replace(oldSo, newSo);
  console.log('✓ Enhanced so() in VideoStudio');
} else {
  console.log('! oldSo not found');
}

// 5. Enhance openVideoFolder button condition (ge || N?.localPath)
const oldBtnShow = 'ge?e.jsx("button",{"aria-label":u("videoStudio.openVideoFolder")';
const newBtnShow = '(ge||N?.localPath)?e.jsx("button",{"aria-label":u("videoStudio.openVideoFolder")';
if (code.includes(oldBtnShow)) {
  code = code.replace(oldBtnShow, newBtnShow);
  console.log('✓ Enhanced openVideoFolder button condition in VideoStudio');
} else {
  console.log('! oldBtnShow not found');
}

fs.writeFileSync(vsPath, code, 'utf8');

// Verify syntax
execSync(`node --check "${vsPath}"`, { stdio: 'inherit' });
console.log('🎉 VideoStudio syntax OK!');
