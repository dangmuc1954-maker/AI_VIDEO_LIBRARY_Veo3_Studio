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
  const mainPath = path.join(root, 'out/main/index.js');
  if (!fs.existsSync(mainPath)) continue;

  let mainCode = fs.readFileSync(mainPath, 'utf8');

  // Insert auto-save logic in writeAsset right after await Ke(n,e.bytes,{signal:A}),K(A);
  const oldKeCall = 'await Ke(n,e.bytes,{signal:A}),K(A);';
  const autoSaveMarker = '/*__AIFORGE_AUTO_DOWNLOAD_WRITEASSET__*/';
  const autoSaveBlock = `await Ke(n,e.bytes,{signal:A}),K(A);${autoSaveMarker}try{if(e.role==="generated"&&global.__aiforge_auto_download){const isVid=e.type==="video",cfg=isVid?global.__aiforge_auto_download.video:global.__aiforge_auto_download.image;if(cfg&&cfg.enabled&&cfg.directory&&typeof cfg.directory==="string"){const fsm=require("fs"),ptm=require("path");if(!fsm.existsSync(cfg.directory))fsm.mkdirSync(cfg.directory,{recursive:!0});let sNum=1;const match=(e.sceneName||e.name||"").match(/\\d+/);if(match)sNum=parseInt(match[0],10);const ext=o||(isVid?".mp4":".png"),prefix=isVid?"Video Cảnh ":"Ảnh Cảnh ";let targetName=prefix+sNum+ext,targetPath=ptm.join(cfg.directory,targetName),cnt=1;while(fsm.existsSync(targetPath)){cnt++;targetPath=ptm.join(cfg.directory,prefix+sNum+"_"+cnt+ext)}fsm.copyFileSync(n,targetPath)}}}catch(eAuto){}`;

  if (mainCode.includes(oldKeCall) && !mainCode.includes(autoSaveMarker)) {
    mainCode = mainCode.replace(oldKeCall, autoSaveBlock);
    fs.writeFileSync(mainPath, mainCode, 'utf8');
    console.log('Added writeAsset auto-download logic in', mainPath);
  }

  try {
    execSync(`node --check "${mainPath}"`);
    console.log('✅ Main syntax valid in', mainPath);
  } catch (e) {
    console.error('❌ Main syntax error:', e.message);
  }
}
