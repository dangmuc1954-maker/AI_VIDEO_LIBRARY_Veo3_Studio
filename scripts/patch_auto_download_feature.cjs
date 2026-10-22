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
  // =========================================================================
  // 1. MAIN PROCESS (app/out/main/index.js)
  //    - Add settings:setAutoDownloadConfig IPC handler
  //    - Add auto-save in writeAsset
  // =========================================================================
  const mainPath = path.join(root, 'out/main/index.js');
  if (fs.existsSync(mainPath)) {
    let mainCode = fs.readFileSync(mainPath, 'utf8');

    // 1.1 Add settings:setAutoDownloadConfig handler
    if (!mainCode.includes('settings:setAutoDownloadConfig')) {
      const oldSettingsAnchor = 'E.handle("settings:getConcurrency",A=>(C(A),_r.getSettings())),';
      const newSettingsAnchor = `E.handle("settings:setAutoDownloadConfig",(A,o)=>{C(A);if(!global.__aiforge_auto_download)global.__aiforge_auto_download={};if(o?.image)global.__aiforge_auto_download.image=o.image;if(o?.video)global.__aiforge_auto_download.video=o.video;return{success:!0}}),` + oldSettingsAnchor;
      if (mainCode.includes(oldSettingsAnchor)) {
        mainCode = mainCode.replace(oldSettingsAnchor, newSettingsAnchor);
        console.log('Added settings:setAutoDownloadConfig in', mainPath);
      }
    }

    // 1.2 Add auto-save logic in writeAsset right after await Ke(n,e.bytes,{signal:A}),K(A);
    const oldKeCall = 'await Ke(n,e.bytes,{signal:A}),K(A);';
    const autoSaveBlock = `await Ke(n,e.bytes,{signal:A}),K(A);try{if(e.role==="generated"&&global.__aiforge_auto_download){const isVid=e.type==="video",cfg=isVid?global.__aiforge_auto_download.video:global.__aiforge_auto_download.image;if(cfg&&cfg.enabled&&cfg.directory&&typeof cfg.directory==="string"){const fsm=require("fs"),ptm=require("path");if(!fsm.existsSync(cfg.directory))fsm.mkdirSync(cfg.directory,{recursive:!0});let sNum=1;const match=(e.sceneName||e.name||"").match(/\\d+/);if(match)sNum=parseInt(match[0],10);const ext=o||(isVid?".mp4":".png"),prefix=isVid?"Video Cảnh ":"Ảnh Cảnh ";let targetName=prefix+sNum+ext,targetPath=ptm.join(cfg.directory,targetName),cnt=1;while(fsm.existsSync(targetPath)){cnt++;targetPath=ptm.join(cfg.directory,prefix+sNum+"_"+cnt+ext)}fsm.copyFileSync(n,targetPath)}}}catch(eAuto){}`;

    if (mainCode.includes(oldKeCall) && !mainCode.includes('global.__aiforge_auto_download')) {
      mainCode = mainCode.replace(oldKeCall, autoSaveBlock);
      console.log('Added writeAsset auto-download logic in', mainPath);
    }

    fs.writeFileSync(mainPath, mainCode, 'utf8');
    try {
      execSync(`node --check "${mainPath}"`);
      console.log('✅ Main syntax valid in', mainPath);
    } catch (e) {
      console.error('❌ Main syntax error:', e.message);
    }
  }

  // =========================================================================
  // 2. PRELOAD (app/out/preload/index.cjs)
  //    - Expose settings.setAutoDownloadConfig
  // =========================================================================
  const preloadPath = path.join(root, 'out/preload/index.cjs');
  if (fs.existsSync(preloadPath)) {
    let pCode = fs.readFileSync(preloadPath, 'utf8');

    const oldSettings = 'w={getConcurrency:()=>r.ipcRenderer.invoke("settings:getConcurrency"),updateConcurrency:e=>r.ipcRenderer.invoke("settings:updateConcurrency",e)}';
    const newSettings = 'w={getConcurrency:()=>r.ipcRenderer.invoke("settings:getConcurrency"),updateConcurrency:e=>r.ipcRenderer.invoke("settings:updateConcurrency",e),setAutoDownloadConfig:e=>r.ipcRenderer.invoke("settings:setAutoDownloadConfig",e)}';

    if (pCode.includes(oldSettings)) {
      pCode = pCode.replace(oldSettings, newSettings);
      fs.writeFileSync(preloadPath, pCode, 'utf8');
      console.log('Exposed setAutoDownloadConfig in', preloadPath);
    }

    try {
      execSync(`node --check "${preloadPath}"`);
      console.log('✅ Preload syntax valid in', preloadPath);
    } catch (e) {
      console.error('❌ Preload syntax error:', e.message);
    }
  }

  // =========================================================================
  // 3. IMAGE STUDIO (app/out/renderer/assets/ImageStudio-4nmpUX3j.js)
  //    - Add Auto Download controls in Prompt Queue Header
  // =========================================================================
  const isPath = path.join(root, 'out/renderer/assets/ImageStudio-4nmpUX3j.js');
  if (fs.existsSync(isPath)) {
    let isCode = fs.readFileSync(isPath, 'utf8');

    // 3.1 Insert state inside function hn
    const hnAnchor = 'const{t:v}=We(),G=xt("upscale_image"),X=xt("remove_watermark_image"),ue=p.useRef(null)';
    const hnState = `const{t:v}=We(),G=xt("upscale_image"),X=xt("remove_watermark_image"),ue=p.useRef(null),[autoDl,setAutoDl]=p.useState(()=>{try{return window.localStorage.getItem("aiforge_auto_download_image")==="true"}catch{return!1}}),[autoDlDir,setAutoDlDir]=p.useState(()=>{try{return window.localStorage.getItem("aiforge_auto_download_dir")||""}catch{return""}});p.useEffect(()=>{try{window.aivideo?.settings?.setAutoDownloadConfig?.({image:{enabled:autoDl,directory:autoDlDir}})}catch{}},[autoDl,autoDlDir]);const onPickDir=async()=>{try{const dir=await window.aivideo?.assets?.selectExportDirectory?.(autoDlDir||"","Chọn thư mục tự động lưu Ảnh AI");if(dir){setAutoDlDir(dir);window.localStorage.setItem("aiforge_auto_download_dir",dir);window.aivideo?.settings?.setAutoDownloadConfig?.({image:{enabled:autoDl,directory:dir}})}}catch{}},onToggleDl=async()=>{if(!autoDl&&!autoDlDir){const dir=await window.aivideo?.assets?.selectExportDirectory?.("","Chọn thư mục tự động lưu Ảnh AI");if(dir){setAutoDlDir(dir);window.localStorage.setItem("aiforge_auto_download_dir",dir);setAutoDl(!0);window.localStorage.setItem("aiforge_auto_download_image","true");window.aivideo?.settings?.setAutoDownloadConfig?.({image:{enabled:!0,directory:dir}});return}}const next=!autoDl;setAutoDl(next);window.localStorage.setItem("aiforge_auto_download_image",String(next));window.aivideo?.settings?.setAutoDownloadConfig?.({image:{enabled:next,directory:autoDlDir}})}`;

    if (isCode.includes(hnAnchor)) {
      isCode = isCode.replace(hnAnchor, hnState);
      console.log('Added state in function hn of', isPath);
    }

    // 3.2 Insert UI buttons in Header
    const isOldHeaderButtons = 'children:[e.jsxs("button",{type:"button","aria-label":v("imageStudio.addRow"),onClick:H,className:"inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg bg-gradient-to-r from-accent to-[#9333ea]';
    const isNewHeaderButtons = `children:[e.jsxs("button",{type:"button",onClick:onPickDir,title:autoDlDir?("Thư mục lưu ảnh: "+autoDlDir+" (Click để đổi)"):("Click để chọn thư mục tự động lưu ảnh trên máy tính"),className:"inline-flex h-8 max-w-[170px] cursor-pointer items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-2.5 text-[11px] font-semibold text-slate-300 hover:border-white/30 hover:bg-white/10 transition-all",children:[e.jsx("span",{children:"📁"}),e.jsx("span",{className:"truncate",children:autoDlDir?(autoDlDir.split(/[\\\\/]/).filter(Boolean).pop()||autoDlDir):"Thư mục lưu..."})]}),e.jsxs("button",{type:"button",onClick:onToggleDl,title:autoDl?"Tự động tải ảnh khi tạo xong: ĐANG BẬT":"Tự động tải ảnh khi tạo xong: ĐANG TẮT",className:\`inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 text-[11px] font-bold transition-all \${autoDl?"border-[#a3e635] bg-[#a3e635]/20 text-[#d9f99d] shadow-[0_0_12px_rgba(163,230,53,0.25)]":"border-white/10 bg-white/5 text-slate-400 hover:text-white"}\`,children:[e.jsx("span",{className:\`h-2 w-2 rounded-full \${autoDl?"bg-[#a3e635] animate-pulse":"bg-slate-500"}\`}),autoDl?"⚡ Tự động tải: BẬT":"⚡ Tự động tải: TẮT"]}),e.jsxs("button",{type:"button","aria-label":v("imageStudio.addRow"),onClick:H,className:"inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg bg-gradient-to-r from-accent to-[#9333ea]`;

    if (isCode.includes(isOldHeaderButtons)) {
      isCode = isCode.replace(isOldHeaderButtons, isNewHeaderButtons);
      console.log('Added auto-download UI buttons in ImageStudio header of', isPath);
    }

    fs.writeFileSync(isPath, isCode, 'utf8');
    try {
      execSync(`node --check "${isPath}"`);
      console.log('✅ ImageStudio syntax valid in', isPath);
    } catch (e) {
      console.error('❌ ImageStudio syntax error:', e.message);
    }
  }

  // =========================================================================
  // 4. VIDEO STUDIO (app/out/renderer/assets/VideoStudio-frcr8V6s.js)
  //    - Add Auto Download controls in Video Queue Header
  // =========================================================================
  const vsPath = path.join(root, 'out/renderer/assets/VideoStudio-frcr8V6s.js');
  if (fs.existsSync(vsPath)) {
    let vsCode = fs.readFileSync(vsPath, 'utf8');

    // 4.1 Insert state inside Video Queue component
    const vsAnchor = 'const de=p=>{switch(p){case"Completed":return P("videoStudio.statusCompleted");case"Running":return P("videoStudio.statusRunning");case"Queued":return P("videoStudio.statusQueued");case"Failed":return P("videoStudio.statusFailed");default:return p}};return e.jsxs(zs,{';
    const vsState = `const[autoDlVid,setAutoDlVid]=l.useState(()=>{try{return window.localStorage.getItem("aiforge_auto_download_video")==="true"}catch{return!1}}),[autoDlVidDir,setAutoDlVidDir]=l.useState(()=>{try{return window.localStorage.getItem("aiforge_auto_download_dir")||""}catch{return""}});l.useEffect(()=>{try{window.aivideo?.settings?.setAutoDownloadConfig?.({video:{enabled:autoDlVid,directory:autoDlVidDir}})}catch{}},[autoDlVid,autoDlVidDir]);const onPickVidDir=async()=>{try{const dir=await window.aivideo?.assets?.selectExportDirectory?.(autoDlVidDir||"","Chọn thư mục tự động lưu Video AI");if(dir){setAutoDlVidDir(dir);window.localStorage.setItem("aiforge_auto_download_dir",dir);window.aivideo?.settings?.setAutoDownloadConfig?.({video:{enabled:autoDlVid,directory:dir}})}}catch{}},onToggleVidDl=async()=>{if(!autoDlVid&&!autoDlVidDir){const dir=await window.aivideo?.assets?.selectExportDirectory?.("","Chọn thư mục tự động lưu Video AI");if(dir){setAutoDlVidDir(dir);window.localStorage.setItem("aiforge_auto_download_dir",dir);setAutoDlVid(!0);window.localStorage.setItem("aiforge_auto_download_video","true");window.aivideo?.settings?.setAutoDownloadConfig?.({video:{enabled:!0,directory:dir}});return}}const next=!autoDlVid;setAutoDlVid(next);window.localStorage.setItem("aiforge_auto_download_video",String(next));window.aivideo?.settings?.setAutoDownloadConfig?.({video:{enabled:next,directory:autoDlVidDir}})};const de=p=>{switch(p){case"Completed":return P("videoStudio.statusCompleted");case"Running":return P("videoStudio.statusRunning");case"Queued":return P("videoStudio.statusQueued");case"Failed":return P("videoStudio.statusFailed");default:return p}};return e.jsxs(zs,{`;

    if (vsCode.includes(vsAnchor)) {
      vsCode = vsCode.replace(vsAnchor, vsState);
      console.log('Added state in Video Queue component of', vsPath);
    }

    // 4.2 Insert UI buttons in Header
    const vsOldHeaderButtons = 'children:[e.jsxs("button",{type:"button","aria-label":P("videoStudio.openMergeModalButton")';
    const vsNewHeaderButtons = `children:[e.jsxs("button",{type:"button",onClick:onPickVidDir,title:autoDlVidDir?("Thư mục lưu video: "+autoDlVidDir+" (Click để đổi)"):("Click để chọn thư mục tự động lưu video trên máy tính"),className:"inline-flex h-8 max-w-[170px] cursor-pointer items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-2.5 text-[11px] font-semibold text-slate-300 hover:border-white/30 hover:bg-white/10 transition-all",children:[e.jsx("span",{children:"📁"}),e.jsx("span",{className:"truncate",children:autoDlVidDir?(autoDlVidDir.split(/[\\\\/]/).filter(Boolean).pop()||autoDlVidDir):"Thư mục lưu..."})]}),e.jsxs("button",{type:"button",onClick:onToggleVidDl,title:autoDlVid?"Tự động tải video khi tạo xong: ĐANG BẬT":"Tự động tải video khi tạo xong: ĐANG TẮT",className:\`inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 text-[11px] font-bold transition-all \${autoDlVid?"border-[#a3e635] bg-[#a3e635]/20 text-[#d9f99d] shadow-[0_0_12px_rgba(163,230,53,0.25)]":"border-white/10 bg-white/5 text-slate-400 hover:text-white"}\`,children:[e.jsx("span",{className:\`h-2 w-2 rounded-full \${autoDlVid?"bg-[#a3e635] animate-pulse":"bg-slate-500"}\`}),autoDlVid?"⚡ Tự động tải: BẬT":"⚡ Tự động tải: TẮT"]}),e.jsxs("button",{type:"button","aria-label":P("videoStudio.openMergeModalButton")`;

    if (vsCode.includes(vsOldHeaderButtons)) {
      vsCode = vsCode.replace(vsOldHeaderButtons, vsNewHeaderButtons);
      console.log('Added auto-download UI buttons in VideoStudio header of', vsPath);
    }

    fs.writeFileSync(vsPath, vsCode, 'utf8');
    try {
      execSync(`node --check "${vsPath}"`);
      console.log('✅ VideoStudio syntax valid in', vsPath);
    } catch (e) {
      console.error('❌ VideoStudio syntax error:', e.message);
    }
  }
}
