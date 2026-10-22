const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('======================================================================');
console.log('🔄 KHÔI PHỤC 2 NODE WORKFLOW TÂM HUYẾT CỦA ANH TRIS 🔄');
console.log('1. Lồng Tiếng & Đồng Bộ Video (video-dubbing)');
console.log('2. Đọc Kịch Bản Âm Thanh -> Văn Bản (video-script-extract)');
console.log('======================================================================');

const rootDir = path.resolve(__dirname, '..');

// ============================================================================
// 1. CẬP NHẬT PRELOAD (app/out/preload/index.cjs)
// ============================================================================
console.log('\n[1/5] Cập nhật preload/index.cjs...');
const preloadPath = path.join(rootDir, 'app/out/preload/index.cjs');
let preloadCode = fs.readFileSync(preloadPath, 'utf8');

if (!preloadCode.includes('syncVoiceoverVideo')) {
  const anchor = 'cancelMerge:e=>r.ipcRenderer.invoke("assets:cancelMerge",e),';
  const addition = 'muxAudioVideo:(e,n,s)=>r.ipcRenderer.invoke("assets:muxAudioVideo",e,n,s),syncVoiceoverVideo:(e,n,s)=>r.ipcRenderer.invoke("assets:syncVoiceoverVideo",e,n,s),transcribeVideoAudio:(e,n)=>r.ipcRenderer.invoke("assets:transcribeVideoAudio",e,n),';
  if (preloadCode.includes(anchor)) {
    preloadCode = preloadCode.replace(anchor, anchor + addition);
    fs.writeFileSync(preloadPath, preloadCode, 'utf8');
    console.log('  ✓ Đã phơi bày syncVoiceoverVideo & transcribeVideoAudio vào window.aiforge.assets');
  } else {
    console.error('  ❌ Không tìm thấy anchor trong preload/index.cjs');
    process.exit(1);
  }
} else {
  console.log('  [-] preload/index.cjs đã có sẵn các method bridge.');
}

// ============================================================================
// 2. CẬP NHẬT BACKEND MAIN (app/out/main/index.js)
// ============================================================================
console.log('\n[2/5] Cập nhật backend main/index.js (syncVoiceoverVideo, transcribeVideoAudio, muxAudioIntoVideo)...');
const mainPath = path.join(rootDir, 'app/out/main/index.js');
let mainCode = fs.readFileSync(mainPath, 'utf8');

// 2a. Thêm IPC handles nếu chưa có
if (!mainCode.includes('assets:syncVoiceoverVideo')) {
  const ipcAnchor = 'E.handle("assets:cancelMerge",(A,o)=>(C(A),R(o,"asset merge operation id"),lt.cancel(o))),';
  const ipcHandlers = `E.handle("assets:syncVoiceoverVideo",async(A,videoAssetId,audioAssetId,options)=>{C(A);const s=lt.begin(Lo(options));try{K(s?.controller.signal);return await V.syncVoiceoverVideo(videoAssetId,audioAssetId,{...options,signal:s?.controller.signal})}finally{lt.finish(s)}}),E.handle("assets:muxAudioVideo",async(A,videoAssetId,audioAssetId,options)=>{C(A);const s=lt.begin(Lo(options));try{K(s?.controller.signal);return await V.muxAudioIntoVideo(videoAssetId,audioAssetId,{...options,signal:s?.controller.signal})}finally{lt.finish(s)}}),E.handle("assets:transcribeVideoAudio",async(A,videoAssetId,options)=>{C(A);const s=lt.begin(Lo(options));try{K(s?.controller.signal);return await V.transcribeVideoAudio(videoAssetId,{...options,signal:s?.controller.signal})}finally{lt.finish(s)}}),`;
  
  if (mainCode.includes(ipcAnchor)) {
    mainCode = mainCode.replace(ipcAnchor, ipcHandlers + ipcAnchor);
    console.log('  ✓ Đã đăng ký IPC handlers: assets:syncVoiceoverVideo, assets:muxAudioVideo, assets:transcribeVideoAudio');
  } else {
    console.error('  ❌ Không tìm thấy ipcAnchor trong main/index.js');
    process.exit(1);
  }
}

// 2b. Thêm methods vào class AssetManager nếu chưa có
if (!mainCode.includes('async syncVoiceoverVideo(')) {
  const methodAnchor = 'async editAndMergeVideos(';
  const backendMethods = fs.readFileSync(path.join(__dirname, 'extracted_backend_methods.js'), 'utf8');
  
  if (mainCode.includes(methodAnchor)) {
    mainCode = mainCode.replace(methodAnchor, backendMethods + '\n' + methodAnchor);
    console.log('  ✓ Đã cấy ghép các hàm xử lý ffmpeg backend chuẩn của Tris vào class AssetManager');
  } else {
    console.error('  ❌ Không tìm thấy methodAnchor trong main/index.js');
    process.exit(1);
  }
}

fs.writeFileSync(mainPath, mainCode, 'utf8');
console.log('  ✓ Đã lưu main/index.js thành công');

// ============================================================================
// 3. CẬP NHẬT RUNTIME INDEXES (app/out/renderer/assets/index-BS7vgKVV.js)
// ============================================================================
console.log('\n[3/5] Cập nhật renderer index-BS7vgKVV.js (Port sets & createNode factory)...');
const indexPath = path.join(rootDir, 'app/out/renderer/assets/index-BS7vgKVV.js');
let indexCode = fs.readFileSync(indexPath, 'utf8');

// 3a. Port validation sets
if (!indexCode.includes('"video-dubbing"')) {
  indexCode = indexCode.replace(
    'video:new Set(["http-request","browser-request","download","delay","loop","condition","merge","select-item"])',
    'video:new Set(["http-request","browser-request","download","delay","loop","condition","merge","select-item","video-script-extract","video-dubbing"])'
  );
  indexCode = indexCode.replace(
    'audio:new Set(["http-request","browser-request","download","delay","loop","condition","merge","select-item"])',
    'audio:new Set(["http-request","browser-request","download","delay","loop","condition","merge","select-item","video-dubbing"])'
  );
  indexCode = indexCode.replace(
    'video:new Set(["google-flow","grok","delay","condition"])',
    'video:new Set(["google-flow","grok","delay","condition","video-script-extract","video-dubbing"])'
  );
  indexCode = indexCode.replace(
    'audio:new Set(["chatgpt-synthesize","elevenlabs","delay","condition"])',
    'audio:new Set(["chatgpt-synthesize","elevenlabs","delay","condition","video-dubbing"])'
  );
  indexCode = indexCode.replace(
    'text:new Set(["prompt","text","chatgpt-analyze","chatgpt-text","convert-data","date-time","delay","condition"])',
    'text:new Set(["prompt","text","chatgpt-analyze","chatgpt-text","convert-data","date-time","delay","condition","video-script-extract"])'
  );
  console.log('  ✓ Đã cập nhật cổng kết nối (Port Sets) video & audio tương thích hoàn hảo');

  // 3b. Node instantiation in createNode
  const selectItemTarget = 'case"select-item":return{id:a,type:"select-item",title:Pn("select-item"),x:r,y:i,width:260,height:96,enabled:!0,active:!0,inputs:[{id:`${a}-in-list`,type:"any",label:"List"}],outputs:[{id:`${a}-out-item`,type:"any",label:"Item"}],config:{index:0}}';
  const newNodesFactory = `;case"video-dubbing":return{id:a,type:"video-dubbing",title:"Lồng Tiếng & Đồng Bộ Video",x:r,y:i,width:400,height:290,enabled:!0,active:!0,inputs:[{id:\`\${a}-in-vid\`,type:"video",label:"Video Veo 3"},{id:\`\${a}-in-aud\`,type:"audio",label:"Voice ElevenLabs"}],outputs:[{id:\`\${a}-out-vid\`,type:"video",label:"Video Hoàn Thành"}],config:{speedMode:"auto",customSpeed:1,mood:"viral_climax",intensity:1,voiceVolume:100,removeOriginalAudio:!0}};case"video-script-extract":return{id:a,type:"video-script-extract",title:"Đọc Kịch Bản (Âm thanh → Văn bản)",x:r,y:i,width:380,height:220,enabled:!0,active:!0,inputs:[{id:\`\${a}-in-vid\`,type:"video",label:"Video"}],outputs:[{id:\`\${a}-out-txt\`,type:"text",label:"Kịch bản thoại"},{id:\`\${a}-out-vid\`,type:"video",label:"Video gốc"}],config:{language:"vi",prompt:"Bóc kịch bản lời thoại nhân vật"}}`;

  if (indexCode.includes(selectItemTarget)) {
    indexCode = indexCode.replace(selectItemTarget, selectItemTarget + newNodesFactory);
    console.log('  ✓ Đã đăng ký cấu trúc khởi tạo Node Factory cho 2 node');
  } else {
    console.error('  ❌ Không tìm thấy selectItemTarget trong index-BS7vgKVV.js');
    process.exit(1);
  }

  fs.writeFileSync(indexPath, indexCode, 'utf8');
  console.log('  ✓ Đã lưu index-BS7vgKVV.js thành công');
} else {
  console.log('  [-] index-BS7vgKVV.js đã có sẵn cấu hình node.');
}

// ============================================================================
// 4. CẬP NHẬT WORKFLOW RUNNER (app/out/renderer/assets/useWorkflowRunner-DGw6Ekx4.js)
// ============================================================================
console.log('\n[4/5] Cập nhật useWorkflowRunner-DGw6Ekx4.js (Logic thực thi 2 node)...');
const runnerPath = path.join(rootDir, 'app/out/renderer/assets/useWorkflowRunner-DGw6Ekx4.js');
let runnerCode = fs.readFileSync(runnerPath, 'utf8');

if (!runnerCode.includes('r.type==="video-dubbing"')) {
  const runnerTarget = 'else if(r.type==="prompt"||r.type==="text"){';
  const runnerBlock = `else if(r.type==="video-dubbing"||r.type==="dubbing"){
  let vid=(k.videos&&k.videos[0])||(k.images&&k.images[0]);
  let aud=k.audios&&k.audios[0];
  if(!vid||!aud){
    const inConns=E.filter(conn=>conn.toNode===r.id);
    for(const conn of inConns){
      const upVal=u.get(conn.fromNode);
      if(!vid&&upVal?.videos&&upVal.videos.length>0) vid=upVal.videos[0];
      if(!vid&&upVal?.outputAssets&&upVal.outputAssets.some(oa=>oa.type==="video")) {
        const vAsset=upVal.outputAssets.find(oa=>oa.type==="video");
        vid={assetId:vAsset.assetId||vAsset.id,url:vAsset.url,thumbnailUrl:vAsset.thumbnailUrl,mimeType:vAsset.mimeType};
      }
      if(!aud&&upVal?.audios&&upVal.audios.length>0) aud=upVal.audios[0];
      if(!aud&&upVal?.outputAssets&&upVal.outputAssets.some(oa=>oa.type==="audio")) {
        const aAsset=upVal.outputAssets.find(oa=>oa.type==="audio");
        aud={assetId:aAsset.assetId||aAsset.id,url:aAsset.url,mimeType:aAsset.mimeType};
      }
    }
  }
  if(!vid)throw new Error(\`\${r.title} cần 1 video đầu vào (từ Veo 3 hoặc thư viện).\`);
  if(!aud)throw new Error(\`\${r.title} cần 1 file âm thanh đầu vào (từ ElevenLabs).\`);
  z(r,"AI Đang phân tích nhịp điệu & cao trào để lồng tiếng chuẩn xác...","info",{phase:"analyze"});
  x(r.id,25);
  y(r.id,{progress:25,statusText:"Đang phân tích nhịp điệu & cao trào"});
  const C=window.aiforge?.assets;
  if(!C?.syncVoiceoverVideo&&!C?.muxAudioVideo)throw new Error("Chức năng lồng tiếng video chưa khả dụng trong preload.");
  const syncFn=C.syncVoiceoverVideo||C.muxAudioVideo;
  const vidId=vid.assetId||vid.id||(typeof vid.url==="string"?vid.url.replace(/^.*\\/asset\\//,"").replace(/\\?.*$/,""):"");
  const audId=aud.assetId||aud.id||(typeof aud.url==="string"?aud.url.replace(/^.*\\/asset\\//,"").replace(/\\?.*$/,""):"");
  x(r.id,50);
  y(r.id,{progress:50,statusText:"Đang xử lý âm thanh & co giãn nhịp điệu"});
  z(r,\`Đang áp dụng bộ lọc giọng đọc: \${r.config?.mood||"Cao trào Viral (Ấm & Dày tiếng)"}\`,"info",{phase:"process"});

  const dubbed=await Is(w,de=>syncFn(vidId,audId,{
    operationId:de,
    speedMode:r.config?.speedMode||"auto",
    customSpeed:typeof r.config?.customSpeed==="number"?r.config.customSpeed:1.0,
    mood:r.config?.mood||"viral_climax",
    intensity:typeof r.config?.intensity==="number"?r.config.intensity:1.0,
    voiceVolume:typeof r.config?.voiceVolume==="number"?r.config.voiceVolume:100,
    removeOriginalAudio:r.config?.removeOriginalAudio!==false,
    keepBackgroundMusic:r.config?.keepBackgroundMusic===true,
    bgmVolume:typeof r.config?.bgmVolume==="number"?r.config.bgmVolume:15,
    name:r.config?.outputName||("Video_Dubbed_"+Date.now()+".mp4")
  }),C.cancelMerge);

  if(w?.aborted)throw new Ze;
  const te=dubbed.ratio||r.config?.outputAspect||"16:9",ce=qa(te);
  z(r,\`Video đã lồng tiếng hoàn tất với âm thanh sống động: \${dubbed.name}\`,"success",{phase:"result"});
  H.videos.push({assetId:dubbed.id,url:dubbed.url,thumbnailUrl:dubbed.thumbnailUrl,mimeType:dubbed.mimeType});
  x(r.id,95);
  y(r.id,{progress:95,statusText:"Hoàn tất lồng tiếng video",width:ce.width,height:ce.height,config:{...r.config,src:dubbed.url,outputAspect:te,outputAssets:[{type:"video",url:dubbed.url,assetId:dubbed.id,thumbnailUrl:dubbed.thumbnailUrl,mimeType:dubbed.mimeType}]}});
}
else if(r.type==="video-script-extract"||r.type==="stt"){
  let vid=(k.videos&&k.videos[0])||(k.images&&k.images[0]);
  if(!vid){
    const inConns=E.filter(conn=>conn.toNode===r.id);
    for(const conn of inConns){
      const upVal=u.get(conn.fromNode);
      if(!vid&&upVal?.videos&&upVal.videos.length>0) vid=upVal.videos[0];
      if(!vid&&upVal?.outputAssets&&upVal.outputAssets.some(oa=>oa.type==="video")) {
        const vAsset=upVal.outputAssets.find(oa=>oa.type==="video");
        vid={assetId:vAsset.assetId||vAsset.id,url:vAsset.url,thumbnailUrl:vAsset.thumbnailUrl,mimeType:vAsset.mimeType};
      }
    }
  }
  if(!vid)throw new Error(\`\${r.title} cần 1 video đầu vào để chuyển âm thanh sang văn bản.\`);
  z(r,"Đang lắng nghe âm thanh video và chuyển thành văn bản chuẩn...","info",{phase:"extract"});
  x(r.id,30);
  y(r.id,{progress:30,statusText:"Đang chuyển âm thanh sang văn bản"});
  const C=window.aiforge?.assets;
  if(!C?.transcribeVideoAudio)throw new Error("Chức năng chuyển âm thanh sang văn bản chưa khả dụng trong preload.");
  const res=await Is(w,de=>C.transcribeVideoAudio(vid.assetId||vid.id||(typeof vid.url==="string"?vid.url.replace(/^.*\\/asset\\//,"").replace(/\\?.*$/,""):""),{operationId:de}),C.cancelMerge);
  if(w?.aborted)throw new Ze;
  const sText=res.script?.trim();
  if(!sText)throw new Error("Không phát hiện được lời thoại trong âm thanh của video.");
  H.text=sText;
  H.texts=[sText];
  H.videos=[vid];
  x(r.id,95);
  y(r.id,{progress:95,statusText:"Đã chuyển âm thanh thành văn bản",config:{...r.config,outputText:sText,duration:res.duration}});
  z(r,\`Đã chuyển âm thanh sang văn bản (\${res.duration}s): "\${sText}"\`,"success",{phase:"result"});
}
`;

  if (runnerCode.includes(runnerTarget)) {
    runnerCode = runnerCode.replace(runnerTarget, runnerBlock + runnerTarget);
    fs.writeFileSync(runnerPath, runnerCode, 'utf8');
    console.log('  ✓ Đã cập nhật useWorkflowRunner-DGw6Ekx4.js với logic thực thi tự động của 2 node');
  } else {
    console.error('  ❌ Không tìm thấy runnerTarget trong useWorkflowRunner-DGw6Ekx4.js');
    process.exit(1);
  }
} else {
  console.log('  [-] useWorkflowRunner-DGw6Ekx4.js đã có sẵn logic.');
}

// ============================================================================
// 5. CẬP NHẬT WORKFLOW EDITOR (app/out/renderer/assets/WorkflowEditor-LHGC9K3C.js)
// ============================================================================
console.log('\n[5/5] Cập nhật WorkflowEditor-LHGC9K3C.js (Giao diện thẻ, Icon, Border, Danh mục Modal)...');
const editorPath = path.join(rootDir, 'app/out/renderer/assets/WorkflowEditor-LHGC9K3C.js');
let editorCode = fs.readFileSync(editorPath, 'utf8');

if (!editorCode.includes('"video-dubbing"')) {
  // 5a. Icon Switch
  const iconAnchor = 'case"select-item":return t.jsx("div",{className:`${n} rounded-lg bg-[#f43f5e]/15 text-[#f43f5e]`,title:"Select Item",children:t.jsx(Bn,{size:14})});';
  const iconAddition = `case"video-dubbing":return t.jsx("div",{className:\`\${n} rounded-lg bg-[#8b5cf6]/15 text-[#a78bfa]\`,title:"Lồng Tiếng & Đồng Bộ Video",children:t.jsx(mu,{size:14})});case"video-script-extract":return t.jsx("div",{className:\`\${n} rounded-lg bg-[#10b981]/15 text-[#34d399]\`,title:"Đọc Kịch Bản (Âm thanh → Văn bản)",children:t.jsx(Dm,{size:14})});`;
  
  if (editorCode.includes(iconAnchor)) {
    editorCode = editorCode.replace(iconAnchor, iconAddition + iconAnchor);
    console.log('  ✓ Đã gắn icon màu sắc chuẩn xác (Tím cho Lồng Tiếng, Xanh Ngọc cho Bóc Kịch Bản)');
  } else {
    console.error('  ❌ Không tìm thấy iconAnchor trong WorkflowEditor');
    process.exit(1);
  }

  // 5b. Border Styles
  const borderAnchor = 'case"convert-data":return"border-[#22d3ee] shadow-[0_0_20px_rgba(34,211,238,0.3)]";';
  const borderAddition = 'case"video-dubbing":return"border-[#8b5cf6] shadow-[0_0_20px_rgba(139,92,246,0.35)]";case"video-script-extract":return"border-[#10b981] shadow-[0_0_20px_rgba(16,185,129,0.35)]";';
  if (editorCode.includes(borderAnchor)) {
    editorCode = editorCode.replace(borderAnchor, borderAddition + borderAnchor);
    console.log('  ✓ Đã cập nhật viền sáng phát quang cho 2 node');
  }

  // 5c. Output assets preview check
  editorCode = editorCode.replace(
    'e.type==="merge")',
    'e.type==="merge"||e.type==="video-script-extract"||e.type==="video-dubbing")'
  );

  // 5d. Card Body UI
  const cardBodies = fs.readFileSync(path.join(__dirname, 'extracted_card_bodies.js'), 'utf8');
  const cardBodyAnchor = ',e.type==="text-splitter"&&t.jsxs("div"';
  
  // Clean cardBodies code
  const sttBody = `e.type==="video-script-extract"&&t.jsxs("div",{className:"flex-1 flex flex-col gap-2 p-2 bg-[#130f2440] border border-white/5 rounded-lg min-h-0 overflow-y-auto scrollbar-thin text-left select-none",children:[t.jsxs("div",{className:"text-[11px] text-text-muted flex justify-between items-center",children:[t.jsx("span",{children:"Tác vụ:"}),t.jsx("span",{className:"font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 text-[10px]",children:"Âm thanh → Văn bản"})]}),e.config?.outputText?t.jsxs("div",{className:"mt-1 border-t border-white/5 pt-1.5 flex flex-col gap-1.5",children:[t.jsxs("div",{className:"flex justify-between items-center select-none",children:[t.jsx("span",{className:"text-[10px] text-emerald-400 font-bold uppercase",children:"Kịch bản lời thoại (có thể gõ sửa):"}),t.jsxs("div",{className:"flex items-center gap-2",children:[e.config?.duration&&t.jsx("span",{className:"text-[9px] text-text-muted font-mono",children:\`\${e.config.duration}s\`}),t.jsxs("button",{type:"button",onClick:fe=>{fe.stopPropagation(),M(e.id)},className:"text-[9px] text-emerald-300 hover:text-emerald-200 underline cursor-pointer",children:["Nhận diện lại"]})]})]}),t.jsx("textarea",{rows:3,value:e.config.outputText,onChange:pe=>{pe.stopPropagation(),f(e.id,{...e.config,outputText:pe.target.value})},className:"nowheel nopan nodrag w-full text-[11px] text-text-primary bg-white/5 p-2 rounded border border-white/10 outline-none focus:border-emerald-400/50 resize-y leading-relaxed font-sans select-text",placeholder:"Kịch bản lời thoại..."})]}):t.jsxs("div",{className:"flex flex-col gap-1.5 mt-0.5",children:[t.jsx("div",{className:"text-[10px] text-text-muted italic leading-snug",children:"Nối Video Veo 3 vào node này rồi bấm nút bên dưới để bóc kịch bản:"}),t.jsxs("button",{type:"button",onClick:fe=>{fe.stopPropagation(),M(e.id)},className:"w-full py-1.5 px-2.5 rounded-md bg-emerald-500/20 hover:bg-emerald-500/30 active:scale-98 border border-emerald-500/30 text-emerald-300 hover:text-emerald-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm",children:[t.jsx(At,{size:12,className:"fill-current"})," Bóc kịch bản ngay"]})]})]}),`;
  
  const dubBody = `e.type==="video-dubbing"&&t.jsxs("div",{className:"flex-1 flex flex-col gap-2 p-2.5 bg-[#170e2b40] border border-purple-500/20 rounded-lg min-h-0 overflow-y-auto scrollbar-thin text-left select-none",children:[t.jsxs("div",{className:"text-[11px] text-text-muted flex justify-between items-center",children:[t.jsx("span",{children:"Tác vụ:"}),t.jsx("span",{className:"font-semibold text-purple-300 bg-purple-500/15 px-2 py-0.5 rounded border border-purple-500/30 text-[10px]",children:"Lồng tiếng & Đồng bộ AI"})]}),t.jsxs("div",{className:"flex flex-col gap-1",children:[t.jsx("label",{className:"text-[10px] text-purple-300 font-medium",children:"Phong cách cao trào & Âm sắc:"}),t.jsxs("select",{value:e.config?.mood||"viral_climax",onChange:pe=>{pe.stopPropagation(),f(e.id,{...e.config,mood:pe.target.value})},className:"nowheel nopan nodrag w-full bg-white/5 text-[11px] text-text-primary px-2 py-1 rounded border border-white/10 outline-none focus:border-purple-400/50 cursor-pointer",children:[t.jsx("option",{value:"viral_climax",className:"bg-[#130f24] text-white",children:"🔥 Cao trào Viral (Ấm & Dày tiếng)"}),t.jsx("option",{value:"broadcast",className:"bg-[#130f24] text-white",children:"🎙️ Chuẩn Studio / Phát Thanh"}),t.jsx("option",{value:"sales_punch",className:"bg-[#130f24] text-white",children:"⚡ Bán Hàng / Năng Lượng Cao"}),t.jsx("option",{value:"crisp",className:"bg-[#130f24] text-white",children:"🌟 Trong Trẻo / Sáng Tiếng"}),t.jsx("option",{value:"natural",className:"bg-[#130f24] text-white",children:"🌿 Tự Nhiên (Gốc ElevenLabs)"})]})]}),t.jsxs("div",{className:"flex flex-col gap-1",children:[t.jsxs("div",{className:"flex justify-between items-center",children:[t.jsx("label",{className:"text-[10px] text-text-muted font-medium",children:"Tốc độ & Nhịp điệu:"}),t.jsx("span",{className:"text-[9px] text-purple-400 font-mono",children:e.config?.speedMode==="custom"?\`\${e.config?.customSpeed||1}x (Thủ công)\`:"Tự động khớp Video"})]}),t.jsxs("div",{className:"flex gap-1 bg-white/5 p-0.5 rounded border border-white/5 text-[10px]",children:[t.jsx("button",{type:"button",onClick:pe=>{pe.stopPropagation(),f(e.id,{...e.config,speedMode:"auto"})},className:\`flex-1 py-0.5 rounded \${e.config?.speedMode!=="custom"?"bg-purple-500/30 text-purple-200 font-medium":"text-text-muted hover:text-white"}\`,children:"Auto-Fit Video"}),t.jsx("button",{type:"button",onClick:pe=>{pe.stopPropagation(),f(e.id,{...e.config,speedMode:"custom",customSpeed:e.config?.customSpeed||1})},className:\`flex-1 py-0.5 rounded \${e.config?.speedMode==="custom"?"bg-purple-500/30 text-purple-200 font-medium":"text-text-muted hover:text-white"}\`,children:"Thủ công"})]}),e.config?.speedMode==="custom"&&t.jsx("input",{type:"range",min:.5,max:2,step:.05,value:e.config?.customSpeed||1,onChange:pe=>{pe.stopPropagation(),f(e.id,{...e.config,customSpeed:parseFloat(pe.target.value)})},className:"nowheel nopan nodrag w-full accent-purple-500 cursor-pointer h-1 bg-white/10 rounded mt-1"})]}),t.jsxs("div",{className:"flex items-center justify-between pt-1 border-t border-white/5",children:[t.jsxs("label",{className:"flex items-center gap-1.5 cursor-pointer text-[10px] text-text-muted hover:text-white",children:[t.jsx("input",{type:"checkbox",checked:e.config?.removeOriginalAudio!==!1,onChange:pe=>{pe.stopPropagation(),f(e.id,{...e.config,removeOriginalAudio:pe.target.checked})},className:"accent-purple-500 rounded cursor-pointer"}),t.jsx("span",{children:"Xóa 100% tiếng gốc"})]}),t.jsxs("span",{className:"text-[9px] text-purple-300 font-mono",children:[\`Voice: \${e.config?.voiceVolume||100}%\`]})]}),t.jsxs("button",{type:"button",onClick:fe=>{fe.stopPropagation(),M(e.id)},className:"w-full mt-1 py-1.5 px-2.5 rounded-md bg-purple-500/25 hover:bg-purple-500/35 active:scale-98 border border-purple-500/35 text-purple-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm",children:[t.jsx(At,{size:12,className:"fill-current"}),"Lồng tiếng video ngay"]})]}),`;

  if (editorCode.includes(cardBodyAnchor)) {
    editorCode = editorCode.replace(cardBodyAnchor, ',' + sttBody + dubBody + 'e.type==="text-splitter"&&t.jsxs("div"');
    console.log('  ✓ Đã cấy ghép toàn bộ Card Body UI chi tiết cho 2 node');
  } else {
    console.error('  ❌ Không tìm thấy cardBodyAnchor trong WorkflowEditor');
    process.exit(1);
  }

  // 5e. Catalog items in Add Node modal
  const catalogAnchor = '{type:"select-item",title:"Select Item",desc:a("workflow.nodeDesc_select_item")}';
  const catalogAddition = `{type:"video-dubbing",title:"Lồng Tiếng & Đồng Bộ Video",desc:"Nhận Video Veo 3 và Voice ElevenLabs, tự động phân tích nhịp điệu, cao trào và lồng tiếng hoàn chỉnh"},{type:"video-script-extract",title:"Đọc Kịch Bản (Âm thanh → Văn bản)",desc:"Nhận video Veo 3, trích xuất âm thanh và chuyển thành văn bản lời thoại để đưa lên ElevenLabs"},`;

  if (editorCode.includes(catalogAnchor)) {
    editorCode = editorCode.replace(catalogAnchor, catalogAddition + catalogAnchor);
    console.log('  ✓ Đã thêm 2 node vào danh mục menu Thêm Node (Add Node modal)');
  } else {
    console.error('  ❌ Không tìm thấy catalogAnchor trong WorkflowEditor');
    process.exit(1);
  }

  fs.writeFileSync(editorPath, editorCode, 'utf8');
  console.log('  ✓ Đã lưu WorkflowEditor-LHGC9K3C.js thành công!');
} else {
  console.log('  [-] WorkflowEditor-LHGC9K3C.js đã có sẵn 2 node.');
}

// ============================================================================
// 6. KIỂM TRA TOÀN BỘ CÚ PHÁP JAVASCRIPT
// ============================================================================
console.log('\n[6/6] Kiểm tra toàn bộ cú pháp JS sau khi cập nhật...');
execSync(`node scripts/verify_all_js.js`, { stdio: 'inherit', cwd: rootDir });

console.log('\n🎉 ĐÃ KHÔI PHỤC HOÀN HẢO 2 NODE WORKFLOW TÂM HUYẾT CỦA ANH TRIS! 🎉');
