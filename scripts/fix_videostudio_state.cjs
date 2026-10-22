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

  if (!vsCode.includes('autoDlVid,setAutoDlVid')) {
    const targetAnchor = 'autoRemoveWatermark:p==="Grok"||p==="Muse AI"?!1:K.autoRemoveWatermark}),';
    const stateCode = `const[autoDlVid,setAutoDlVid]=l.useState(()=>{try{return window.localStorage.getItem("aiforge_auto_download_video")==="true"}catch{return!1}}),[autoDlVidDir,setAutoDlVidDir]=l.useState(()=>{try{return window.localStorage.getItem("aiforge_auto_download_dir")||""}catch{return""}});l.useEffect(()=>{try{window.aivideo?.settings?.setAutoDownloadConfig?.({video:{enabled:autoDlVid,directory:autoDlVidDir}})}catch{}},[autoDlVid,autoDlVidDir]);const onPickVidDir=async()=>{try{const dir=await window.aivideo?.assets?.selectExportDirectory?.(autoDlVidDir||"","Chọn thư mục tự động lưu Video AI");if(dir){setAutoDlVidDir(dir);window.localStorage.setItem("aiforge_auto_download_dir",dir);window.aivideo?.settings?.setAutoDownloadConfig?.({video:{enabled:autoDlVid,directory:dir}})}}catch{}},onToggleVidDl=async()=>{if(!autoDlVid&&!autoDlVidDir){const dir=await window.aivideo?.assets?.selectExportDirectory?.("","Chọn thư mục tự động lưu Video AI");if(dir){setAutoDlVidDir(dir);window.localStorage.setItem("aiforge_auto_download_dir",dir);setAutoDlVid(!0);window.localStorage.setItem("aiforge_auto_download_video","true");window.aivideo?.settings?.setAutoDownloadConfig?.({video:{enabled:!0,directory:dir}});return}}const next=!autoDlVid;setAutoDlVid(next);window.localStorage.setItem("aiforge_auto_download_video",String(next));window.aivideo?.settings?.setAutoDownloadConfig?.({video:{enabled:next,directory:autoDlVidDir}})};`;

    if (vsCode.includes(targetAnchor)) {
      vsCode = vsCode.replace(targetAnchor, targetAnchor + stateCode);
      fs.writeFileSync(vsPath, vsCode, 'utf8');
      console.log('Successfully added autoDlVid state in', vsPath);
    } else {
      console.log('WARN: targetAnchor not found in', vsPath);
    }
  } else {
    console.log('autoDlVid state already present in', vsPath);
  }

  try {
    execSync(`node --check "${vsPath}"`);
    console.log('✅ VideoStudio syntax valid in', vsPath);
  } catch (e) {
    console.error('❌ VideoStudio syntax error:', e.message);
  }
}
