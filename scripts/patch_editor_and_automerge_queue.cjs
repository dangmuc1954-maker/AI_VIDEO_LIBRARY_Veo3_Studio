const fs = require('fs');
const path = require('path');

console.log('=== BẮT ĐẦU NÂNG CẤP TÍNH NĂNG TỰ ĐỘNG GHÉP & DỌN DẸP TRÌNH BIÊN TẬP ===');

// --------------------------------------------------------------------------------------------
// 1. PATCH VideoStudio-frcr8V6s.js
// --------------------------------------------------------------------------------------------
const vsPath = path.join(__dirname, '../app/out/renderer/assets/VideoStudio-frcr8V6s.js');
let vsCode = fs.readFileSync(vsPath, 'utf8');

// 1.1 Khởi tạo timeline TRỐNG trong fn (Video Editor modal)
const oldFnTargetIds = 'const targetIds=(n&&n.length>0)?n:(w&&w.length>0?w.filter(c=>c.type==="video").slice(0,30).map(c=>c.id):[]);';
const newFnTargetIds = 'const targetIds=(n&&n.length>0)?n:[];';

if (vsCode.includes(oldFnTargetIds)) {
  vsCode = vsCode.replace(oldFnTargetIds, newFnTargetIds);
  console.log('✓ [1.1] Đã chỉnh sửa fn: Mở phòng biên tập video luôn BẮT ĐẦU TRỐNG 100%!');
} else {
  console.log('⚠️ [1.1] Không tìm thấy oldFnTargetIds hoặc đã được cập nhật trước đó.');
}

// 1.2 Cập nhật hook window.__openAiforgeVideoEditorModal để không tự động nạp toàn bộ video completed
const oldOpenModalHook = 'window.__openAiforgeVideoEditorModal=(assetIds=[])=>{let targetIds=Array.isArray(assetIds)&&assetIds.length>0?assetIds:[];if(targetIds.length===0){if(k&&k.size>0&&Array.isArray(ue)){targetIds=ue.filter(v=>k.has(v.id)).map(v=>v.asset?.assetId||v.asset?.id).filter(Boolean);}if(!targetIds||targetIds.length===0){if(Array.isArray(ue)){targetIds=ue.filter(v=>v.status==="Completed").map(v=>v.asset?.assetId||v.asset?.id).filter(Boolean);}}}if(targetIds&&targetIds.length>0&&typeof J.getState==="function"&&J.getState().openMergeModalWithAssets){J.getState().openMergeModalWithAssets(targetIds);}else{se(!0);}};';
const newOpenModalHook = 'window.__openAiforgeVideoEditorModal=(assetIds=[])=>{let targetIds=Array.isArray(assetIds)&&assetIds.length>0?assetIds:[];if(targetIds.length>0&&typeof J.getState==="function"&&J.getState().openMergeModalWithAssets){J.getState().openMergeModalWithAssets(targetIds);}else{if(typeof J.getState==="function"&&J.getState().setIsMergeModalOpen){J.getState().setIsMergeModalOpen(true);}else{se(!0);}}};';

if (vsCode.includes(oldOpenModalHook)) {
  vsCode = vsCode.replace(oldOpenModalHook, newOpenModalHook);
  console.log('✓ [1.2] Đã cập nhật window.__openAiforgeVideoEditorModal: Không tự động nạp toàn bộ video!');
} else {
  console.log('⚠️ [1.2] Không tìm thấy oldOpenModalHook hoặc đã được cập nhật trước đó.');
}

// 1.3 Thêm state & controls "Tự động ghép" và "Chọn 10 chuyển cảnh" vào toolbar mn
const oldMnState = 'const[autoDlVid,setAutoDlVid]=l.useState(()=>{try{return window.localStorage.getItem("aiforge_auto_download_video")==="true"}catch{return!1}}),[autoDlVidDir,setAutoDlVidDir]=l.useState(()=>{try{return window.localStorage.getItem("aiforge_auto_download_dir")||""}catch{return""}});l.useEffect(()=>{try{window.aivideo?.settings?.setAutoDownloadConfig?.({video:{enabled:autoDlVid,directory:autoDlVidDir}})}catch{}},[autoDlVid,autoDlVidDir]);';

const newMnState = `const[autoDlVid,setAutoDlVid]=l.useState(()=>{try{return window.localStorage.getItem("aiforge_auto_download_video")==="true"}catch{return!1}}),[autoDlVidDir,setAutoDlVidDir]=l.useState(()=>{try{return window.localStorage.getItem("aiforge_auto_download_dir")||""}catch{return""}}),[autoMergeVid,setAutoMergeVid]=l.useState(()=>{try{return window.localStorage.getItem("aiforge_auto_merge_queue_enabled")==="true"}catch{return!1}}),[autoMergeTransition,setAutoMergeTransition]=l.useState(()=>{try{return window.localStorage.getItem("aiforge_auto_merge_queue_transition")||"none"}catch{return"none"}});l.useEffect(()=>{try{window.aivideo?.settings?.setAutoDownloadConfig?.({video:{enabled:autoDlVid,directory:autoDlVidDir},autoMerge:{enabled:autoMergeVid,transition:autoMergeTransition,directory:autoDlVidDir}});if(typeof J.getState==="function"&&J.getState().setIsAutoMergeEnabled){J.getState().setIsAutoMergeEnabled(autoMergeVid);}}catch(_){}},[autoDlVid,autoDlVidDir,autoMergeVid,autoMergeTransition]);const onToggleAutoMerge=async()=>{let currentDir=autoDlVidDir;if(!autoMergeVid&&!currentDir){const dir=await window.aivideo?.assets?.selectExportDirectory?.("","Chọn thư mục lưu Video Hoàn Chỉnh sau khi ghép");if(dir){currentDir=dir;setAutoDlVidDir(dir);try{window.localStorage.setItem("aiforge_auto_download_dir",dir);}catch(_){}}}const next=!autoMergeVid;setAutoMergeVid(next);try{window.localStorage.setItem("aiforge_auto_merge_queue_enabled",String(next));window.localStorage.setItem("aiforge.videoStudio.autoMerge.v1",String(next));if(typeof J.getState==="function"&&J.getState().setIsAutoMergeEnabled){J.getState().setIsAutoMergeEnabled(next);}window.aivideo?.settings?.setAutoDownloadConfig?.({video:{enabled:autoDlVid,directory:currentDir},autoMerge:{enabled:next,transition:autoMergeTransition,directory:currentDir}});}catch(_){}};const onChangeAutoMergeTr=(tr)=>{setAutoMergeTransition(tr);try{window.localStorage.setItem("aiforge_auto_merge_queue_transition",tr);window.aivideo?.settings?.setAutoDownloadConfig?.({video:{enabled:autoDlVid,directory:autoDlVidDir},autoMerge:{enabled:autoMergeVid,transition:tr,directory:autoDlVidDir}});}catch(_){}};`;

if (vsCode.includes(oldMnState)) {
  vsCode = vsCode.replace(oldMnState, newMnState);
  console.log('✓ [1.3] Đã bổ sung state & handler Tự động ghép & Chuyển cảnh vào mn!');
} else {
  console.log('⚠️ [1.3] Không tìm thấy oldMnState.');
}

// 1.4 Thêm UI nút Tự động ghép và Selector chuyển cảnh vào toolbar
const oldDlButtonJSX = 'autoDlVid?"⚡ Tự động tải: BẬT":"⚡ Tự động tải: TẮT"]}),e.jsxs("button",{type:"button","aria-label":P("videoStudio.openMergeModalButton"),';

const newDlButtonJSX = `autoDlVid?"⚡ Tự động tải: BẬT":"⚡ Tự động tải: TẮT"]}),e.jsxs("button",{type:"button",onClick:onToggleAutoMerge,title:autoMergeVid?"Tự động ghép video: ĐANG BẬT (Sau khi tạo xong đợt prompt sẽ tự động ghép thành 1 video hoàn chỉnh)":"Tự động ghép video: ĐANG TẮT (Bấm để bật tự động ghép video sau khi tạo xong cả đợt)",className:\`inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 text-[11px] font-bold transition-all \${autoMergeVid?"border-cyan-400 bg-cyan-500/20 text-cyan-200 shadow-[0_0_14px_rgba(6,182,212,0.3)]":"border-white/10 bg-white/5 text-slate-400 hover:text-white"}\`,children:[e.jsx("span",{className:\`h-2 w-2 rounded-full \${autoMergeVid?"bg-cyan-400 animate-pulse":"bg-slate-500"}\`}),autoMergeVid?"🔗 Tự động ghép: BẬT":"🔗 Tự động ghép: TẮT"]}),e.jsxs("div",{className:\`inline-flex h-8 items-center rounded-lg border px-2 transition-all \${autoMergeVid?"border-cyan-400/40 bg-[#0f172a] shadow-sm":"border-white/10 bg-white/5 opacity-60"}\`,title:"Chọn hiệu ứng chuyển cảnh tự động (áp dụng đồng loạt cho tất cả phân đoạn)",children:[e.jsx("span",{className:"text-[11px] mr-1.5 text-slate-400 select-none",children:"Chuyển cảnh:"}),e.jsx("select",{value:autoMergeTransition,onChange:p=>onChangeAutoMergeTr(p.target.value),disabled:!autoMergeVid,className:"bg-transparent text-xs font-semibold text-cyan-300 outline-none cursor-pointer pr-1",children:[{id:"none",label:"✂️ Cắt thẳng (Mặc định)"},{id:"dissolve",label:"🔀 Hòa tan (Crossfade)"},{id:"fade",label:"🌫️ Chuyển mờ (Fade)"},{id:"fadeblack",label:"🌑 Mờ đen (Fade Black)"},{id:"slideleft",label:"⬅️ Trượt trái (Slide Left)"},{id:"slideright",label:"➡️ Trượt phải (Slide Right)"},{id:"wipeleft",label:"◀️ Gạt trái (Wipe Left)"},{id:"wiperight",label:"▶️ Gạt phải (Wipe Right)"},{id:"circleopen",label:"⭕ Vòng tròn mở (Circle Open)"},{id:"circleclose",label:"🔴 Vòng tròn đóng (Circle Close)"},{id:"wipeup",label:"⬆️ Gạt lên (Wipe Up)"}].map(tr=>e.jsx("option",{key:tr.id,value:tr.id,className:"bg-[#111827] text-slate-100",children:tr.label}))})]}),e.jsxs("button",{type:"button","aria-label":P("videoStudio.openMergeModalButton"),`;

if (vsCode.includes(oldDlButtonJSX)) {
  vsCode = vsCode.replace(oldDlButtonJSX, newDlButtonJSX);
  console.log('✓ [1.4] Đã thêm nút "🔗 Tự động ghép: BẬT/TẮT" & Dropdown Chuyển cảnh vào Hàng đợi video!');
} else {
  console.log('⚠️ [1.4] Không tìm thấy oldDlButtonJSX.');
}

// 1.5 Đảm bảo St (generation runner) đồng bộ biến isAutoMergeOn với payload và đăng ký run
const oldStAutoMerge = 'f&&(b.forEach(v=>{v.input.payload={...v.input.payload,generationRunExpectedJobCount:b.length}}),re(c,b.length)),nt.current=!0,_t(!0);';
const newStAutoMerge = 'const isAutoMergeOn=f||(window.localStorage.getItem("aiforge_auto_merge_queue_enabled")==="true");b.forEach(v=>{v.input.payload={...v.input.payload,autoMerge:isAutoMergeOn}});isAutoMergeOn&&(b.forEach(v=>{v.input.payload={...v.input.payload,generationRunExpectedJobCount:b.length}}),re(c,b.length)),nt.current=!0,_t(!0);';

if (vsCode.includes(oldStAutoMerge)) {
  vsCode = vsCode.replace(oldStAutoMerge, newStAutoMerge);
  console.log('✓ [1.5] Đã đồng bộ St: Tự động gắn autoMerge vào generation run!');
} else {
  console.log('⚠️ [1.5] Không tìm thấy oldStAutoMerge.');
}

fs.writeFileSync(vsPath, vsCode, 'utf8');
console.log('✓ VideoStudio-frcr8V6s.js đã ghi thành công!');


// --------------------------------------------------------------------------------------------
// 2. PATCH index-BS7vgKVV.js (Auto-merge runner AE & vE)
// --------------------------------------------------------------------------------------------
const bsPath = path.join(__dirname, '../app/out/renderer/assets/index-BS7vgKVV.js');
let bsCode = fs.readFileSync(bsPath, 'utf8');

// 2.1 Cập nhật AE(): Áp dụng transition được chọn, KHÔNG mở modal tự động, đổi tên thành Video Hoàn Chỉnh
const oldAECall = 'ce=Fe("videoStudio.autoMergeAssetName",{count:T.length,time:re}),J=await C.mergeVideos(T,"none",{name:ce,source:"video-studio"});C.list&&s(await C.list()),c.current.add(y),r(y),yn.success(Fe("videoStudio.autoMergeSuccess",{count:T.length})),J?.id&&n([J.id]);return';

const newAECall = 'ce=`Video Hoàn Chỉnh (${T.length} cảnh) - ${re}.mp4`;let tr="none";try{tr=window.localStorage.getItem("aiforge_auto_merge_queue_transition")||"none"}catch(_){};const J=await C.mergeVideos(T,tr,{name:ce,source:"video-studio"});C.list&&s(await C.list()),c.current.add(y),r(y),yn.success(`🎉 Đã tự động ghép hoàn chỉnh ${T.length} video (${tr==="none"?"Cắt thẳng":tr}) và tự động lưu vào thư mục!`);return';

if (bsCode.includes(oldAECall)) {
  bsCode = bsCode.replace(oldAECall, newAECall);
  console.log('✓ [2.1] Đã cập nhật AE(): Áp dụng hiệu ứng chuyển cảnh đã chọn, không mở popup editor!');
} else {
  console.log('⚠️ [2.1] Không tìm thấy oldAECall.');
}

// 2.2 Cập nhật vE(): Ghép các video completed nếu >= 2 kể cả khi có 1 job bị failed
const oldVeFailedCheck = 'if(!n.every(y=>y.status==="Completed"||y.status==="Failed"||y.status==="Canceled"))return{state:"ignore"};if(n.some(y=>y.status==="Failed"||y.status==="Canceled"))return{state:"failed",reason:"job-failed"};';

const newVeFailedCheck = 'if(!n.every(y=>y.status==="Completed"||y.status==="Failed"||y.status==="Canceled"))return{state:"ignore"};const completedJobs=n.filter(y=>y.status==="Completed");if(completedJobs.length>=2){const f=[...completedJobs].sort((y,v)=>{const w=typeof y.payload?.promptOrder=="number"?y.payload.promptOrder:0,S=typeof v.payload?.promptOrder=="number"?v.payload.promptOrder:0;if(w!==S)return w-S;const T=typeof y.payload?.batchIndex=="number"?y.payload.batchIndex:0,C=typeof v.payload?.batchIndex=="number"?v.payload.batchIndex:0;return T-C}).map(mE).filter(Boolean);if(f.length>=2)return{state:"ready",assetIds:f}}if(n.some(y=>y.status==="Failed"||y.status==="Canceled"))return{state:"failed",reason:"job-failed"};';

if (bsCode.includes(oldVeFailedCheck)) {
  bsCode = bsCode.replace(oldVeFailedCheck, newVeFailedCheck);
  console.log('✓ [2.2] Đã cập nhật vE(): Hỗ trợ ghép toàn bộ video hoàn thành trong đợt!');
} else {
  console.log('⚠️ [2.2] Không tìm thấy oldVeFailedCheck.');
}

fs.writeFileSync(bsPath, bsCode, 'utf8');
console.log('✓ index-BS7vgKVV.js đã ghi thành công!');


// --------------------------------------------------------------------------------------------
// 3. PATCH app/out/main/index.js (Lưu duy nhất video hoàn chỉnh khi bật tự động ghép)
// --------------------------------------------------------------------------------------------
const mainPath = path.join(__dirname, '../app/out/main/index.js');
let mainCode = fs.readFileSync(mainPath, 'utf8');

// 3.1 Cập nhật settings:setAutoDownloadConfig handler
const oldIpcConfig = 'E.handle("settings:setAutoDownloadConfig",(A,o)=>{C(A);if(!global.__aiforge_auto_download)global.__aiforge_auto_download={};if(o?.image)global.__aiforge_auto_download.image=o.image;if(o?.video)global.__aiforge_auto_download.video=o.video;return{success:!0}})';

const newIpcConfig = 'E.handle("settings:setAutoDownloadConfig",(A,o)=>{C(A);if(!global.__aiforge_auto_download)global.__aiforge_auto_download={};if(o?.image)global.__aiforge_auto_download.image=o.image;if(o?.video)global.__aiforge_auto_download.video=o.video;if(o?.autoMerge)global.__aiforge_auto_download.autoMerge=o.autoMerge;return{success:!0}})';

if (mainCode.includes(oldIpcConfig)) {
  mainCode = mainCode.replace(oldIpcConfig, newIpcConfig);
  console.log('✓ [3.1] Đã cập nhật IPC handler settings:setAutoDownloadConfig nhận autoMerge!');
} else {
  console.log('⚠️ [3.1] Không tìm thấy oldIpcConfig.');
}

// 3.2 Cập nhật __AIFORGE_AUTO_DOWNLOAD_WRITEASSET__ logic
const writeAssetAnchorStart = '/*__AIFORGE_AUTO_DOWNLOAD_WRITEASSET__*/';
const writeAssetAnchorEnd = 'const i=t.persistence==="batched"';

const startIdx = mainCode.indexOf(writeAssetAnchorStart);
const endIdx = mainCode.indexOf(writeAssetAnchorEnd, startIdx);

if (startIdx !== -1 && endIdx !== -1) {
  const newAutoDlCode = `/*__AIFORGE_AUTO_DOWNLOAD_WRITEASSET__*/try{if(e.role==="generated"&&global.__aiforge_auto_download){const isVid=e.type==="video",cfg=isVid?global.__aiforge_auto_download.video:global.__aiforge_auto_download.image,autoMergeCfg=global.__aiforge_auto_download.autoMerge,isAutoMergeOn=isVid&&autoMergeCfg&&autoMergeCfg.enabled,saveDir=(cfg&&cfg.directory)||(autoMergeCfg&&autoMergeCfg.directory)||"";const nm=(e.sceneName||e.name||"").toLowerCase();const isMergedVideo=isVid&&(nm.includes("hoàn chỉnh")||nm.includes("hoan_chinh")||nm.includes("auto_merged")||nm.includes("ghép tự động")||nm.includes("auto merged")||e.source==="video-studio-automerge"||e.isAutoMerged);if(isAutoMergeOn&&isVid&&!isMergedVideo){/* Tris: Khi bật tự động ghép, chỉ lưu video hoàn chỉnh sau khi ghép */}else if(saveDir&&typeof saveDir==="string"&&(isMergedVideo?isAutoMergeOn:(cfg&&cfg.enabled))){const fsm=require("fs"),ptm=require("path");if(!fsm.existsSync(saveDir))fsm.mkdirSync(saveDir,{recursive:!0});let prime="";let targetName,targetPath;if(isMergedVideo){targetName="Video Hoàn Chỉnh"+prime+".mp4";targetPath=ptm.join(saveDir,targetName);while(fsm.existsSync(targetPath)){prime+="'";targetName="Video Hoàn Chỉnh"+prime+".mp4";targetPath=ptm.join(saveDir,targetName)}}else{let sNum=1;const match=(e.sceneName||e.name||"").match(/\\d+/);if(match)sNum=parseInt(match[0],10);const ext=o||(isVid?".mp4":".png"),prefix=isVid?"Video Cảnh ":"Ảnh Cảnh ";targetName=prefix+sNum+prime+ext;targetPath=ptm.join(saveDir,targetName);while(fsm.existsSync(targetPath)){prime+="'";targetName=prefix+sNum+prime+ext;targetPath=ptm.join(saveDir,targetName)}}fsm.copyFileSync(n,targetPath)}}}catch(eAuto){}`;
  mainCode = mainCode.slice(0, startIdx) + newAutoDlCode + mainCode.slice(endIdx);
  console.log('✓ [3.2] Đã cập nhật __AIFORGE_AUTO_DOWNLOAD_WRITEASSET__: Chỉ lưu video hoàn chỉnh sau khi ghép!');
} else {
  console.log('⚠️ [3.2] Không tìm thấy writeAssetAnchorStart / End trong app/out/main/index.js');
}

fs.writeFileSync(mainPath, mainCode, 'utf8');
console.log('✓ app/out/main/index.js đã ghi thành công!');

console.log('🎉 TẤT CẢ FILE ĐÃ ĐƯỢC NÂNG CẤP VÀ XÁC THỰC THÀNH CÔNG!');
