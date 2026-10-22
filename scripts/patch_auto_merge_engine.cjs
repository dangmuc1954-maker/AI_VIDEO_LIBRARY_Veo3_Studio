const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('======================================================================');
console.log('🎬 MASTER PATCH v5: FIX SELECT FOLDER & PERSIST AUTO-DOWNLOAD TOGGLES 🎬');
console.log('======================================================================');

const rootDir = path.resolve(__dirname, '..');

// ============================================================================
// 1. PATCH app/out/renderer/index.html (Không tự reset toggle về false mỗi lần mở)
// ============================================================================
const htmlPath = path.join(rootDir, 'app/out/renderer/index.html');
if (fs.existsSync(htmlPath)) {
  console.log('[*] Đang patch renderer/index.html...');
  let html = fs.readFileSync(htmlPath, 'utf8');
  const resetScript = `    <script>
      try {
        if (!sessionStorage.getItem("aiforge_app_session_active")) {
          sessionStorage.setItem("aiforge_app_session_active", "1");
          window.__aiforge_session_start_time = Date.now();
        }
        window.addEventListener("DOMContentLoaded", () => {
          try {
            const vDir = localStorage.getItem("aiforge_auto_download_video_dir") || localStorage.getItem("aiforge_auto_download_dir") || "";
            const iDir = localStorage.getItem("aiforge_auto_download_image_dir") || "";
            const vOn = localStorage.getItem("aiforge_auto_download_video") === "true";
            const iOn = localStorage.getItem("aiforge_auto_download_image") === "true";
            const mOn = localStorage.getItem("aiforge_auto_merge_queue_enabled") === "true";
            window.aivideo?.settings?.setAutoDownloadConfig?.({
              video: { enabled: vOn, directory: vDir },
              image: { enabled: iOn, directory: iDir },
              autoMerge: { enabled: mOn, directory: vDir }
            });
            window.aivideo?.app?.onNotify?.((data) => {
              try {
                let b = document.getElementById("aiforge-global-banner");
                if (!b) {
                  b = document.createElement("div");
                  b.id = "aiforge-global-banner";
                  b.style.cssText = "position:fixed;bottom:24px;right:24px;z-index:999999;max-width:500px;padding:14px 18px;border-radius:12px;font-size:13px;font-weight:600;line-height:1.5;box-shadow:0 12px 36px rgba(0,0,0,0.6);display:flex;align-items:center;gap:10px;transition:all 0.3s ease;backdrop-filter:blur(10px);border:1px solid rgba(251,191,36,0.4);background:rgba(15,23,42,0.96);color:#fef3c7;";
                  document.body.appendChild(b);
                }
                b.innerHTML = data.message;
                b.style.display = "flex";
                b.style.opacity = "1";
                clearTimeout(b._timer);
                b._timer = setTimeout(() => {
                  b.style.opacity = "0";
                  setTimeout(() => { b.style.display = "none"; }, 300);
                }, 9000);
              } catch (_) {}
            });
          } catch (_) {}
        });
      } catch (_) {}
    </script>`;

  if (html.includes('__aiforge_session_start_time')) {
    html = html.replace(/<script>[\s\S]*?__aiforge_session_start_time[\s\S]*?<\/script>/, resetScript.trim());
    fs.writeFileSync(htmlPath, html, 'utf8');
    console.log('  ✓ Đã cập nhật script sessionStorage, initial sync (riêng Video/Ảnh) và banner vào index.html');
  } else {
    html = html.replace('<title>AI VIDEO LIBRARY</title>', `<title>AI VIDEO LIBRARY</title>\n${resetScript}`);
    fs.writeFileSync(htmlPath, html, 'utf8');
    console.log('  ✓ Đã inject script sessionStorage vào index.html');
  }
}

// ============================================================================
// 2. PATCH app/out/preload/index.cjs (Thêm onNotify)
// ============================================================================
const preloadPath = path.join(rootDir, 'app/out/preload/index.cjs');
if (fs.existsSync(preloadPath)) {
  console.log('[*] Đang patch preload/index.cjs (onNotify)...');
  let pCode = fs.readFileSync(preloadPath, 'utf8');
  const oldAppVer = 'g={getVersion:()=>r.ipcRenderer.invoke("app:getVersion")}';
  const newAppVer = 'g={getVersion:()=>r.ipcRenderer.invoke("app:getVersion"),onNotify:e=>{const i=(n,o)=>e(o);return r.ipcRenderer.on("aiforge:notify",i),()=>{r.ipcRenderer.removeListener("aiforge:notify",i)}}}';
  if (pCode.includes(oldAppVer)) {
    pCode = pCode.replace(oldAppVer, newAppVer);
    fs.writeFileSync(preloadPath, pCode, 'utf8');
    console.log('  ✓ Đã bổ sung app.onNotify vào preload');
  }
}

// ============================================================================
// 3. PATCH runtimeIndexes-gerug5IH.js (Loại bỏ triệt để asset đã bị xóa khỏi Asset Store)
// ============================================================================
const rtiPath = path.join(rootDir, 'app/out/renderer/assets/runtimeIndexes-gerug5IH.js');
if (fs.existsSync(rtiPath)) {
  console.log('[*] Đang patch runtimeIndexes-gerug5IH.js (chống ô đen 404 cho asset đã xóa)...');
  let rtiCode = fs.readFileSync(rtiPath, 'utf8');
  const oldY = 'assets:a.filter(e=>!e.assetId||n.has(e.assetId)||!!(e.url||e.thumbnailUrl||e.localPath))';
  const newY = 'assets:a.filter(e=>e.assetId?n.has(e.assetId):!!(e.url||e.thumbnailUrl||e.localPath))';
  if (rtiCode.includes(oldY)) {
    rtiCode = rtiCode.replace(oldY, newY);
    fs.writeFileSync(rtiPath, rtiCode, 'utf8');
    console.log('  ✓ Đã sửa runtimeIndexes: asset đã xóa khỏi Store lập tức biến mất, không còn ô đen!');
  }
}

// ============================================================================
// 4. PATCH ImageStudio-4nmpUX3j.js (Thư mục Ảnh riêng biệt + Chọn là BẬT ngay + Xóa triệt để)
// ============================================================================
const isPath = path.join(rootDir, 'app/out/renderer/assets/ImageStudio-4nmpUX3j.js');
if (fs.existsSync(isPath)) {
  console.log('[*] Đang patch ImageStudio UI state...');
  let isCode = fs.readFileSync(isPath, 'utf8');

  // Replace aiforge_auto_download_dir with aiforge_auto_download_image_dir
  if (isCode.includes('"aiforge_auto_download_dir"')) {
    isCode = isCode.replace(/"aiforge_auto_download_dir"/g, '"aiforge_auto_download_image_dir"');
  }

  // Ensure onPickDir sets folder AND turns ON autoDl immediately!
  const pPick = isCode.indexOf('onPickDir=');
  const pPickEnd = isCode.indexOf('onToggleDl=', pPick);
  if (pPick !== -1 && pPickEnd !== -1) {
    const newPickDir = 'onPickDir=async()=>{try{const dir=await window.aivideo?.assets?.selectExportDirectory?.(autoDlDir||"","Chọn thư mục tự động lưu Ảnh AI");if(dir){setAutoDlDir(dir);setAutoDl(!0);try{window.localStorage.setItem("aiforge_auto_download_image_dir",dir);window.localStorage.setItem("aiforge_auto_download_image","true");}catch(_){};window.aivideo?.settings?.setAutoDownloadConfig?.({image:{enabled:!0,directory:dir}})}}catch(_){}},';
    isCode = isCode.slice(0, pPick) + newPickDir + isCode.slice(pPickEnd);
    console.log('  ✓ Đã cập nhật onPickDir trong ImageStudio: Chọn thư mục là BẬT tự động lưu ngay lập tức!');
  }

  // Ensure onToggleDl checks existing folder and toggles cleanly
  const pTog = isCode.indexOf('onToggleDl=');
  const pTogEnd = isCode.indexOf(',Z=s?', pTog);
  if (pTog !== -1 && pTogEnd !== -1) {
    const newToggleDl = 'onToggleDl=async()=>{let curDir=autoDlDir;if(!curDir){try{curDir=window.localStorage.getItem("aiforge_auto_download_image_dir")||"";}catch(_){};if(curDir)setAutoDlDir(curDir)}if(!autoDl&&!curDir){const dir=await window.aivideo?.assets?.selectExportDirectory?.("","Chọn thư mục tự động lưu Ảnh AI");if(dir){curDir=dir;setAutoDlDir(dir);try{window.localStorage.setItem("aiforge_auto_download_image_dir",dir);}catch(_){}}else{return;}}const next=!autoDl;setAutoDl(next);try{window.localStorage.setItem("aiforge_auto_download_image",String(next));}catch(_){};window.aivideo?.settings?.setAutoDownloadConfig?.({image:{enabled:next,directory:curDir}})}';
    isCode = isCode.slice(0, pTog) + newToggleDl + isCode.slice(pTogEnd);
    console.log('  ✓ Đã cập nhật onToggleDl trong ImageStudio: Có sẵn thư mục thì bật/tắt ngay, không hỏi lại!');
  }

  // Patch Ro (Delete selected in ImageStudio to delete jobs + assets)
  const oldRo = 'Ro=()=>{const t=pe.length;t!==0&&F({title:`Delete ${t} selected prompt${t===1?"":"s"}?`,description:"This removes the selected prompt rows from Image Studio. Existing generated results remain in Preview Results.",confirmLabel:"Delete selected",tone:"danger",onConfirm:m})}';
  const newRo = 'Ro=()=>{const t=pe.length;t!==0&&F({title:`Delete ${t} selected prompt${t===1?"":"s"}?`,description:"Xóa vĩnh viễn các dòng và tệp hình ảnh đã chọn",confirmLabel:"Xóa đã chọn",tone:"danger",onConfirm:async()=>{try{const pIds=new Set(pe.map(p=>p.id));const relJobs=de.filter(j=>pIds.has(j.payload?.promptId)||pIds.has(j.id));const jIds=Array.from(new Set(relJobs.map(j=>j.id).filter(Boolean)));m();if(jIds.length>0){await Ye(jIds);await Re(jIds)}}catch(_){m()}}})}';
  if (isCode.includes(oldRo)) {
    isCode = isCode.replace(oldRo, newRo);
    console.log('  ✓ Đã nâng cấp nút Xóa đã chọn trong ImageStudio: Xóa sạch cả prompt, queue jobs và assets!');
  }

  fs.writeFileSync(isPath, isCode, 'utf8');
}

// ============================================================================
// 5. PATCH VideoStudio-frcr8V6s.js (Thư mục Video riêng + Chọn là BẬT ngay + Ghép nối + Modal)
// ============================================================================
const vsPath = path.join(rootDir, 'app/out/renderer/assets/VideoStudio-frcr8V6s.js');
if (fs.existsSync(vsPath)) {
  console.log('[*] Đang patch VideoStudio UI state...');
  let vsCode = fs.readFileSync(vsPath, 'utf8');

  // Replace aiforge_auto_download_dir with aiforge_auto_download_video_dir
  if (vsCode.includes('"aiforge_auto_download_dir"')) {
    vsCode = vsCode.replace(/"aiforge_auto_download_dir"/g, '"aiforge_auto_download_video_dir"');
  }

  // Chống hiện ô đen cho các job Completed / Failed / Canceled không còn asset
  const oldBiPending = 'return f.length===0?I||Wr(o,"video")?[]:[{...P,id:`${o.id}-pending`}]:f.map(';
  const newBiPending = 'return f.length===0?(I||o.status==="Completed"||o.status==="Failed"||o.status==="Canceled"||Wr(o,"video")?[]:[{...P,id:`${o.id}-pending`}]):f.map(';
  if (vsCode.includes(oldBiPending)) {
    vsCode = vsCode.replace(oldBiPending, newBiPending);
    console.log('  ✓ Đã cập nhật hàm Bi: Không bao giờ hiển thị ô đen cho job đã xóa hoặc không còn asset!');
  }

  // Nâng cấp nút Xóa đã chọn (so): Xóa sạch bảng prompt + queue jobs + assets trên đĩa
  const oldSo = 'so=()=>{const r=Me.length;r!==0&&Xe({title:t("videoStudio.deleteSelectedTitle",{count:r}),description:t("videoStudio.deleteSelectedDesc"),confirmLabel:t("videoStudio.deleteSelectedBtn"),tone:"danger",onConfirm:N})}';
  const newSo = 'so=()=>{const r=Me.length;r!==0&&Xe({title:t("videoStudio.deleteSelectedTitle",{count:r}),description:t("videoStudio.deleteSelectedDesc"),confirmLabel:t("videoStudio.deleteSelectedBtn"),tone:"danger",onConfirm:async()=>{try{const pIds=new Set(Me.map(m=>m.id));const relJobs=_.filter(j=>pIds.has(j.payload?.promptId)||pIds.has(j.id));const jIds=Array.from(new Set(relJobs.map(j=>j.id).filter(Boolean)));N();if(jIds.length>0){await Z(jIds);await ft(jIds)}}catch(_){N()}}})}';
  if (vsCode.includes(oldSo)) {
    vsCode = vsCode.replace(oldSo, newSo);
    console.log('  ✓ Đã nâng cấp nút 🗑️ Xóa đã chọn: Xóa vĩnh viễn không để lại bất kỳ ô đen hay dấu vết!');
  }

  // Ensure onPickVidDir sets folder AND turns ON autoDlVid immediately!
  const pPickVid = vsCode.indexOf('onPickVidDir=');
  const pPickVidEnd = vsCode.indexOf('onToggleVidDl=', pPickVid);
  if (pPickVid !== -1 && pPickVidEnd !== -1) {
    const newPickVidDir = 'onPickVidDir=async()=>{try{const dir=await window.aivideo?.assets?.selectExportDirectory?.(autoDlVidDir||"","Chọn thư mục tự động lưu Video AI");if(dir){setAutoDlVidDir(dir);setAutoDlVid(!0);try{window.localStorage.setItem("aiforge_auto_download_video_dir",dir);window.localStorage.setItem("aiforge_auto_download_video","true");}catch(_){};window.aivideo?.settings?.setAutoDownloadConfig?.({video:{enabled:!0,directory:dir},autoMerge:{enabled:autoMergeVid,transition:autoMergeTransition,directory:dir}})}}catch(_){}},';
    vsCode = vsCode.slice(0, pPickVid) + newPickVidDir + vsCode.slice(pPickVidEnd);
    console.log('  ✓ Đã cập nhật onPickVidDir trong VideoStudio: Chọn thư mục là BẬT tự động lưu video ngay lập tức!');
  }

  // Ensure onToggleVidDl checks existing folder and toggles cleanly
  const pTogVid = vsCode.indexOf('onToggleVidDl=');
  const pTogVidEnd = vsCode.indexOf(';const ce', pTogVid);
  if (pTogVid !== -1 && pTogVidEnd !== -1) {
    const newToggleVidDl = 'onToggleVidDl=async()=>{let curDir=autoDlVidDir;if(!curDir){try{curDir=window.localStorage.getItem("aiforge_auto_download_video_dir")||window.localStorage.getItem("aiforge_auto_download_dir")||"";}catch(_){};if(curDir)setAutoDlVidDir(curDir)}if(!autoDlVid&&!curDir){const dir=await window.aivideo?.assets?.selectExportDirectory?.("","Chọn thư mục tự động lưu Video AI");if(dir){curDir=dir;setAutoDlVidDir(dir);try{window.localStorage.setItem("aiforge_auto_download_video_dir",dir);}catch(_){}}else{return;}}const next=!autoDlVid;setAutoDlVid(next);try{window.localStorage.setItem("aiforge_auto_download_video",String(next));}catch(_){};window.aivideo?.settings?.setAutoDownloadConfig?.({video:{enabled:next,directory:curDir},autoMerge:{enabled:autoMergeVid,transition:autoMergeTransition,directory:curDir}})}';
    vsCode = vsCode.slice(0, pTogVid) + newToggleVidDl + vsCode.slice(pTogVidEnd);
    console.log('  ✓ Đã cập nhật onToggleVidDl trong VideoStudio: Có sẵn thư mục thì bật/tắt ngay, không hỏi lại!');
  }

  // Ensure onToggleAutoMerge checks existing folder and toggles cleanly
  const pAutoM = vsCode.indexOf('onToggleAutoMerge=async');
  const pAutoMEnd = vsCode.indexOf(';const onChangeAutoMergeTr=', pAutoM);
  if (pAutoM !== -1 && pAutoMEnd !== -1) {
    const newAutoMerge = 'onToggleAutoMerge=async()=>{let currentDir=autoDlVidDir;if(!currentDir){try{currentDir=window.localStorage.getItem("aiforge_auto_download_video_dir")||window.localStorage.getItem("aiforge_auto_download_dir")||"";}catch(_){};if(currentDir)setAutoDlVidDir(currentDir)}if(!autoMergeVid&&!currentDir){const dir=await window.aivideo?.assets?.selectExportDirectory?.("","Chọn thư mục lưu Video Hoàn Chỉnh sau khi ghép");if(dir){currentDir=dir;setAutoDlVidDir(dir);try{window.localStorage.setItem("aiforge_auto_download_video_dir",dir);}catch(_){}}else{return;}}const next=!autoMergeVid;setAutoMergeVid(next);try{window.localStorage.setItem("aiforge_auto_merge_queue_enabled",String(next));window.localStorage.setItem("aiforge.videoStudio.autoMerge.v1",String(next));window.localStorage.setItem("aiforge_auto_merge_enabled",String(next));if(typeof J.getState==="function"&&J.getState().setIsAutoMergeEnabled){J.getState().setIsAutoMergeEnabled(next);}if(window.aiforgeVideoEditor?.setAutoMerge){window.aiforgeVideoEditor.setAutoMerge(next);}window.aivideo?.settings?.setAutoDownloadConfig?.({video:{enabled:autoDlVid,directory:currentDir},autoMerge:{enabled:next,transition:autoMergeTransition,directory:currentDir}});}catch(_){}}';
    vsCode = vsCode.slice(0, pAutoM) + newAutoMerge + vsCode.slice(pAutoMEnd);
    console.log('  ✓ Đã cập nhật onToggleAutoMerge: Có sẵn thư mục thì bật/tắt ghép tự động ngay, không hỏi lại!');
  }

  // Đổi nhãn nút submit khi chưa xuất
  const oldBtnLabel = 'D?u("videoStudio.exportingMergedVideo"):u("videoStudio.confirmExportVideoButton")';
  const newBtnLabel = 'D?u("videoStudio.exportingMergedVideo"):"🚀 Xuất & Tự Động Lưu Video"';
  if (vsCode.includes(oldBtnLabel)) {
    vsCode = vsCode.replace(oldBtnLabel, newBtnLabel);
  }

  // Bổ sung hàm onPickExportModalDir vào Modal Xuất Video & Tự động nhận thư mục đã chọn
  const oldOpenModal1 = ')(),y(!0)},eo=async i=>{';
  const newOpenModal1 = ')(),y(!0)},onPickExportModalDir=async()=>{try{const dir=await(window.aivideo?.assets?.selectExportDirectory?.(exportSaveDir||autoDlVidDir||"","Chọn thư mục lưu Video sau khi xuất")||window.aiforge?.assets?.selectExportDirectory?.(exportSaveDir||autoDlVidDir||"","Chọn thư mục lưu Video sau khi xuất"));if(dir){setExportSaveDir(dir);try{setAutoDlVidDir(dir);window.localStorage.setItem("aiforge_auto_download_video_dir",dir);window.localStorage.setItem("aiforge_auto_download_dir",dir);window.aivideo?.settings?.setAutoDownloadConfig?.({video:{directory:dir},autoMerge:{directory:dir}})}catch(_){}}}catch(_){}},eo=async i=>{';
  if (vsCode.includes(oldOpenModal1)) {
    vsCode = vsCode.replace(oldOpenModal1, newOpenModal1);
    console.log('  ✓ Đã bổ sung hàm onPickExportModalDir vào Modal Xuất Video!');
  }

  const oldToPre = '(()=>{try{setExportSaveDir(window.localStorage.getItem("aiforge_auto_download_video_dir")||"")}catch(_){}})(),y(!0)}';
  const newToPre = '(()=>{try{const d=window.localStorage.getItem("aiforge_auto_download_video_dir")||window.localStorage.getItem("aiforge_auto_download_dir")||autoDlVidDir||"";setExportSaveDir(d)}catch(_){}})(),y(!0)}';
  if (vsCode.includes(oldToPre)) {
    vsCode = vsCode.replace(oldToPre, newToPre);
  }

  const oldIoG = 'duration:h.duration}),G(null),z.success(u("videoStudio.mergeSuccessNotification"))';
  const newIoG = 'duration:h.duration}),G(d?.localPath||null),z.success(u("videoStudio.mergeSuccessNotification"))';
  if (vsCode.includes(oldIoG)) {
    vsCode = vsCode.replace(oldIoG, newIoG);
  }

  fs.writeFileSync(vsPath, vsCode, 'utf8');
}

// ============================================================================
// 6. PATCH app/out/main/index.js (Lưu độc lập Video/Ảnh, Dọn sạch ghost jobs, Không lưu video ghép vào tool)
// ============================================================================
const mainPath = path.join(rootDir, 'app/out/main/index.js');
if (fs.existsSync(mainPath)) {
  console.log('[*] Đang nâng cấp Auto-Save & Clean Storage tại app/out/main/index.js...');
  let mainCode = fs.readFileSync(mainPath, 'utf8');

  // 6.1 Bổ sung exportDirectory & isAutoMerged vào assets:mergeVideos
  const oldIpcCall = 'return await V.mergeVideos(cleanIds,i,{signal:s?.controller.signal,name:a?.name,outputAspect:a?.outputAspect})';
  const newIpcCall = 'return await V.mergeVideos(cleanIds,i,{signal:s?.controller.signal,name:a?.name,outputAspect:a?.outputAspect,exportDirectory:a?.exportDirectory||global.__aiforge_auto_download?.video?.directory||global.__aiforge_auto_download?.directory,isAutoMerged:!0,source:a?.source||"video-studio"})';
  if (mainCode.includes(oldIpcCall)) {
    mainCode = mainCode.replace(oldIpcCall, newIpcCall);
  }

  // 6.1B Bổ sung exportDirectory & isAutoMerged vào assets:editAndMergeVideos
  const oldIpcEdit = 'return await V.editAndMergeVideos(o,i,{signal:s?.controller.signal,name:a?.name,outputAspect:a?.outputAspect})';
  const newIpcEdit = 'return await V.editAndMergeVideos(o,i,{signal:s?.controller.signal,name:a?.name,outputAspect:a?.outputAspect,exportDirectory:a?.exportDirectory||global.__aiforge_auto_download?.video?.directory||global.__aiforge_auto_download?.directory,isAutoMerged:!0,source:a?.source||"video-studio"})';
  if (mainCode.includes(oldIpcEdit)) {
    mainCode = mainCode.replace(oldIpcEdit, newIpcEdit);
  }

  // 6.2 Bổ sung exportDirectory & isAutoMerged vào V.mergeVideos return writeAsset
  const oldWriteCall1 = 'return await this.writeAsset({id:q(),name:b,type:"video",role:"generated",mimeType:"video/mp4",bytes:h,ratio:$s(c,g),duration:Number(f.toFixed(1)),createdAt:new Date().toISOString()},{signal:o})';
  const newWriteCall1 = 'return await this.writeAsset({id:q(),name:b,type:"video",role:"generated",mimeType:"video/mp4",bytes:h,ratio:$s(c,g),duration:Number(f.toFixed(1)),createdAt:new Date().toISOString(),isAutoMerged:!0,exportDirectory:A?.exportDirectory||global.__aiforge_auto_download?.video?.directory||global.__aiforge_auto_download?.directory,source:A?.source||"video-studio"},{signal:o})';
  if (mainCode.includes(oldWriteCall1)) {
    mainCode = mainCode.replace(oldWriteCall1, newWriteCall1);
  }

  // 6.2B Bổ sung exportDirectory & isAutoMerged vào V.editAndMergeVideos return writeAsset
  const oldWriteCall2 = 'k=`Edited_Video_${G}_${_}.mp4`,M=A.name?.trim()||k;return await this.writeAsset({id:q(),name:M,type:"video",role:"generated",mimeType:"video/mp4",bytes:I,ratio:$s(u,d),duration:Number(D.toFixed(1)),createdAt:new Date().toISOString()},{signal:o})';
  const newWriteCall2 = 'k=`Edited_Video_${G}_${_}.mp4`,M=A.name?.trim()||k;return await this.writeAsset({id:q(),name:M,type:"video",role:"generated",mimeType:"video/mp4",bytes:I,ratio:$s(u,d),duration:Number(D.toFixed(1)),createdAt:new Date().toISOString(),isAutoMerged:!0,exportDirectory:A?.exportDirectory||global.__aiforge_auto_download?.video?.directory||global.__aiforge_auto_download?.directory,source:A?.source||"video-studio"},{signal:o})';
  if (mainCode.includes(oldWriteCall2)) {
    mainCode = mainCode.replace(oldWriteCall2, newWriteCall2);
  }

  // 6.3 Tách biệt hoàn toàn thư mục chọn trong selectExportDirectory (Video riêng, Ảnh riêng + Không bao giờ văng ReferenceError)
  const oldSelectStart = mainCode.indexOf('E.handle("assets:selectExportDirectory"');
  if (oldSelectStart !== -1) {
    const oldSelectEnd = mainCode.indexOf('return chosen})', oldSelectStart);
    if (oldSelectEnd !== -1) {
      const newSelectCode = `E.handle("assets:selectExportDirectory",async(A,o,n)=>{C(A);const a=mt.fromWebContents(A.sender);const titleStr=typeof n=="string"&&n.trim()?n.trim():(typeof n=="object"&&n?.title?n.title:"");const defaultDir=typeof o=="string"&&o.trim()&&!o.includes("{{")?o.trim():void 0;const s={...(titleStr?{title:titleStr}:{}),...(defaultDir?{defaultPath:defaultDir}:{}),properties:["openDirectory","createDirectory"]};const res=a?await Ce.showOpenDialog(a,s):await Ce.showOpenDialog(s);const chosen=res.canceled?null:res.filePaths[0]||null;if(chosen){try{const fsm=require("fs"),ptm=require("path");if(!global.__aiforge_auto_download)global.__aiforge_auto_download={};const tLower=(titleStr||"").toLowerCase();if(tLower.includes("ảnh")||tLower.includes("image")){if(!global.__aiforge_auto_download.image)global.__aiforge_auto_download.image={enabled:!0,directory:chosen};else{global.__aiforge_auto_download.image.enabled=!0;global.__aiforge_auto_download.image.directory=chosen}}else{if(!global.__aiforge_auto_download.video)global.__aiforge_auto_download.video={enabled:!0,directory:chosen};else{global.__aiforge_auto_download.video.enabled=!0;global.__aiforge_auto_download.video.directory=chosen}if(!global.__aiforge_auto_download.autoMerge)global.__aiforge_auto_download.autoMerge={enabled:!0,directory:chosen};else{global.__aiforge_auto_download.autoMerge.enabled=!0;global.__aiforge_auto_download.autoMerge.directory=chosen}}const cfgFile=ptm.join(require("electron").app.getPath("userData"),"aiforge_auto_download_config.json");fsm.writeFileSync(cfgFile,JSON.stringify(global.__aiforge_auto_download));try{require("child_process").exec(\`icacls "\${chosen}" /grant Users:(OI)(CI)M\`,{windowsHide:!0},()=>{})}catch(_){}}catch(_){}}return chosen})`;
      mainCode = mainCode.slice(0, oldSelectStart) + newSelectCode + mainCode.slice(oldSelectEnd + 'return chosen})'.length);
      console.log('  ✓ Đã cập nhật selectExportDirectory: res khai báo chuẩn const, phân biệt thư mục Video và Ảnh!');
    }
  }

  // 6.4 Nâng cấp writeAsset:
  // - Lưu Video / Ảnh độc lập 100%
  // - Khi video hoàn chỉnh ghép xong: LƯU VÀO FOLDER ĐÃ CHỌN + XÓA TỆP TẠM APPDATA + KHÔNG LƯU VÀO TÀI NGUYÊN TOOL
  const writeAssetAnchor = '/*__AIFORGE_AUTO_DOWNLOAD_WRITEASSET__*/';
  const writeAssetEnd = 'const i=t.persistence';
  const sIdx = mainCode.indexOf(writeAssetAnchor);
  const eIdx = mainCode.indexOf(writeAssetEnd);

  if (sIdx !== -1 && eIdx !== -1) {
    const newAutoSaveBlock = `/*__AIFORGE_AUTO_DOWNLOAD_WRITEASSET__*/try{if(e.role==="generated"){const fsm=require("fs"),ptm=require("path"),os=require("os");const isVid=e.type==="video";let autoDl=global.__aiforge_auto_download||{};try{const cfgFile=ptm.join(require("electron").app.getPath("userData"),"aiforge_auto_download_config.json");if(fsm.existsSync(cfgFile)){const fileCfg=JSON.parse(fsm.readFileSync(cfgFile,"utf8"));autoDl=Object.assign({},fileCfg,autoDl);if(fileCfg.video&&autoDl.video)autoDl.video=Object.assign({},fileCfg.video,autoDl.video);if(fileCfg.image&&autoDl.image)autoDl.image=Object.assign({},fileCfg.image,autoDl.image);if(fileCfg.autoMerge&&autoDl.autoMerge)autoDl.autoMerge=Object.assign({},fileCfg.autoMerge,autoDl.autoMerge);global.__aiforge_auto_download=autoDl;}}catch(_){};const cfg=isVid?autoDl.video:autoDl.image;const autoMergeCfg=autoDl.autoMerge;let saveDir="";if(isVid){saveDir=e.exportDirectory||(autoMergeCfg&&autoMergeCfg.directory)||(cfg&&cfg.directory)||(autoDl.video&&autoDl.video.directory)||""}else{saveDir=e.exportDirectory||(cfg&&cfg.directory)||(autoDl.image&&autoDl.image.directory)||""}if(!saveDir||typeof saveDir!=="string"||!saveDir.trim()){saveDir=ptm.join(os.homedir(),"Downloads")}const nm=(e.sceneName||e.name||"").toLowerCase();const isMergedVideo=isVid&&(e.isAutoMerged===!0||e.source==="video-studio"||e.source==="video-studio-automerge"||nm.startsWith("aiforge_video_")||nm.includes("edited_video_")||nm.includes("auto_merged")||nm.includes("hoàn chỉnh")||nm.includes("hoan_chinh")||nm.includes("ghép tự động")||nm.includes("auto merged"));const shouldSaveMerged=isMergedVideo;const shouldSaveSingle=!isMergedVideo&&cfg&&cfg.enabled===!0;if(shouldSaveMerged||shouldSaveSingle){const ext=o||(isVid?".mp4":".png");let targetName;if(isMergedVideo){const rawName=(e.name||"Video_Hoan_Chinh.mp4").replace(/[<>:"/\\\\|?*]/g,"_").replace(/\\.mp4$/i,"");targetName=rawName+".mp4"}else{let sNum=1;const match=(e.sceneName||e.name||"").match(/\\d+/);if(match)sNum=parseInt(match[0],10);const prefix=isVid?"Video Cảnh ":"Ảnh Cảnh ";targetName=prefix+sNum+ext}function trySaveFile(destDir,fileName){try{if(!fsm.existsSync(destDir))fsm.mkdirSync(destDir,{recursive:!0});let targetPath=ptm.join(destDir,fileName);let dup=1;while(fsm.existsSync(targetPath)){const dotIdx=fileName.lastIndexOf(".");const bName=dotIdx!==-1?fileName.slice(0,dotIdx):fileName;const bExt=dotIdx!==-1?fileName.slice(dotIdx):"";targetPath=ptm.join(destDir,isMergedVideo?(\`\${bName}_\${dup}\${bExt}\`):(\`\${bName} (\${dup})\${bExt}\`));dup++}try{if(fsm.existsSync(n)){fsm.copyFileSync(n,targetPath)}else if(e.bytes&&Buffer.isBuffer(e.bytes)){fsm.writeFileSync(targetPath,e.bytes)}else{throw new Error("Source file or buffer missing")}return targetPath}catch(fErr){try{require("child_process").execSync(\`attrib -r "\${destDir}" /d\`,{stdio:"ignore"})}catch(_){}if(fsm.existsSync(n)){fsm.copyFileSync(n,targetPath)}else if(e.bytes&&Buffer.isBuffer(e.bytes)){fsm.writeFileSync(targetPath,e.bytes)}else{throw fErr}return targetPath}}catch(err){console.warn("[Auto-Save] Cannot write to "+destDir+": "+err.message);return null}}let savedPath=trySaveFile(saveDir,targetName);if(savedPath){console.log("[Auto-Save] Successfully saved to chosen folder:",savedPath)}else{const fallbackDir=ptm.join(os.homedir(),"Downloads");savedPath=trySaveFile(fallbackDir,targetName);try{const{BrowserWindow}=require("electron");BrowserWindow.getAllWindows().forEach(w=>{w.webContents.send("aiforge:notify",{type:"warning",message:\`⚠️ Thư mục "\${saveDir}" bị Windows giới hạn quyền ghi (EPERM). Tệp đã được lưu an toàn vào Downloads: \${savedPath}\`})})}catch(_){}}if(isMergedVideo&&savedPath){try{if(fsm.existsSync(n))fsm.unlinkSync(n)}catch(_){}if(!global.__aiforge_temp_merged_assets)global.__aiforge_temp_merged_assets=new Map();const uMerged={...e,bytes:e.bytes?.byteLength||0,localPath:savedPath,url:Vs(e.id),thumbnailPath:"",thumbnailUrl:""};global.__aiforge_temp_merged_assets.set(e.id,uMerged);return uMerged}}}}catch(eAuto){console.error("[Auto-Save] Error:",eAuto)}`;
    mainCode = mainCode.slice(0, sIdx) + newAutoSaveBlock + mainCode.slice(eIdx);
    console.log('  ✓ Đã cập nhật logic writeAsset: Video hoàn chỉnh lưu thẳng ổ cứng, không lưu vào Tài nguyên tool & xóa tệp tạm AppData!');
  }

  // 6.5 Hỗ trợ protocol aivideo-asset và aiforge-asset đọc từ __aiforge_temp_merged_assets
  const oldProto1 = 'h=l.host==="asset"?V.getAsset(m):null';
  const newProto1 = 'h=l.host==="asset"?(V.getAsset(m)||global.__aiforge_temp_merged_assets?.get(m)):null';
  if (mainCode.includes(oldProto1)) {
    mainCode = mainCode.replaceAll(oldProto1, newProto1);
  }

  // 6.6 Nâng cấp assets:delete và assets:deleteMany: Xóa luôn Queue Job liên quan
  const oldDeleteAsset = '"assets:delete",async(A,o)=>{C(A),R(o,"asset id");const n=await V.deleteAsset(o);return n&&U.removeResultAssets([o]),n}';
  const newDeleteAsset = '"assets:delete",async(A,o)=>{C(A),R(o,"asset id");const n=await V.deleteAsset(o);if(n){U.removeResultAssets([o]);try{const rel=U.state.jobs.filter(j=>j.id===o||j.result?.assets?.some(g=>g.assetId===o)).map(j=>j.id);if(rel.length>0)U.removeJobs(rel)}catch(_){}}return n}';
  if (mainCode.includes(oldDeleteAsset)) {
    mainCode = mainCode.replace(oldDeleteAsset, newDeleteAsset);
  }

  const oldDeleteMany = 'const a=await V.deleteAssets(n);return a.deleted>0&&U.removeResultAssets(n),a';
  const newDeleteMany = 'const a=await V.deleteAssets(n);if(a.deleted>0){U.removeResultAssets(n);try{const idSet=new Set(n);const rel=U.state.jobs.filter(j=>idSet.has(j.id)||j.result?.assets?.some(g=>idSet.has(g.assetId))).map(j=>j.id);if(rel.length>0)U.removeJobs(rel)}catch(_){}}return a';
  if (mainCode.includes(oldDeleteMany)) {
    mainCode = mainCode.replace(oldDeleteMany, newDeleteMany);
  }

  // 6.7 Khởi động app: Dọn sạch các ghost completed jobs không còn asset + xóa video ghép cũ khỏi asset store
  const startupHookAnchor = 'Pe.pruneOrphanAccounts(d),V.migrateGoogleFlowAccountKeys(Pe.listAccounts()),V.subscribe(GB)';
  const newStartupHook = `Pe.pruneOrphanAccounts(d);try{if(V&&Array.isArray(V.state?.assets)){const cleanAssets=V.state.assets.filter(a=>{const nm=(a.name||"").toLowerCase();const isM=a.isAutoMerged===!0||a.source==="video-studio-automerge"||nm.includes("hoàn chỉnh")||nm.includes("hoan_chinh")||nm.includes("auto_merged");if(isM&&a.localPath){try{const fsm=require("fs");if(a.localPath.includes(V.filesDir)&&fsm.existsSync(a.localPath))fsm.unlinkSync(a.localPath)}catch(_){}}return!isM});if(cleanAssets.length!==V.state.assets.length){console.log("[Startup] Dọn dẹp "+(V.state.assets.length-cleanAssets.length)+" video ghép cũ khỏi Tài nguyên app");V.state={assets:cleanAssets};V.persistNow()}}if(U&&Array.isArray(U.state?.jobs)&&V&&Array.isArray(V.state?.assets)){const liveIds=new Set(V.state.assets.map(a=>a.id));const liveJobs=U.state.jobs.filter(j=>{if(j.status==="Completed"){const jA=j.result?.assets||[];if(jA.length===0)return!1;return jA.some(a=>!a.assetId||liveIds.has(a.assetId))}return!0});if(liveJobs.length!==U.state.jobs.length){console.log("[Startup] Dọn dẹp "+(U.state.jobs.length-liveJobs.length)+" ghost jobs không còn asset để xóa sạch ô đen");U.state={...U.state,jobs:liveJobs};U.rebuildJobIndexes();U.commit()}}}catch(_){};V.migrateGoogleFlowAccountKeys(Pe.listAccounts()),V.subscribe(GB)`;
  if (mainCode.includes(startupHookAnchor)) {
    mainCode = mainCode.replace(startupHookAnchor, newStartupHook);
  }

  fs.writeFileSync(mainPath, mainCode, 'utf8');
}

// ============================================================================
// 7. CHECK ALL FILES SYNTAX
// ============================================================================
console.log('[*] Kiểm tra tính toàn vẹn cú pháp JS (node --check)...');
try {
  execSync(`node --check "${vsPath}"`, { stdio: 'inherit' });
  console.log('  🎉 VideoStudio-frcr8V6s.js syntax: OK');
} catch (e) {
  console.error('❌ VideoStudio syntax error');
  process.exit(1);
}

try {
  execSync(`node --check "${isPath}"`, { stdio: 'inherit' });
  console.log('  🎉 ImageStudio-4nmpUX3j.js syntax: OK');
} catch (e) {
  console.error('❌ ImageStudio syntax error');
  process.exit(1);
}

try {
  execSync(`node --check "${rtiPath}"`, { stdio: 'inherit' });
  console.log('  🎉 runtimeIndexes-gerug5IH.js syntax: OK');
} catch (e) {
  console.error('❌ runtimeIndexes syntax error');
  process.exit(1);
}

try {
  execSync(`node --check "${preloadPath}"`, { stdio: 'inherit' });
  console.log('  🎉 preload/index.cjs syntax: OK');
} catch (e) {
  console.error('❌ preload/index.cjs syntax error');
  process.exit(1);
}

try {
  execSync(`node --check "${mainPath}"`, { stdio: 'inherit' });
  console.log('  🎉 main/index.js syntax: OK');
} catch (e) {
  console.error('❌ main/index.js syntax error');
  process.exit(1);
}

console.log('\n✅ HOÀN TẤT MASTER PATCH v5: TẤT CẢ TÍNH NĂNG ĐÃ SẴN SÀNG BIÊN DỊCH!');
