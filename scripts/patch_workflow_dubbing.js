const fs = require('fs');
const path = require('path');

console.log('=== BẮT ĐẦU TÍCH HỢP NODE: LỒNG TIẾNG & ĐỒNG BỘ VIDEO ===');

// 1. PATCH useWorkflowRunner-BmcV20yZ.js
const runnerFile = path.join(__dirname, '../app/out/renderer/assets/useWorkflowRunner-BmcV20yZ.js');
let runnerCode = fs.readFileSync(runnerFile, 'utf8');

const runnerTarget = 'else if(r.type==="video-script-extract"||r.type==="stt"){';
if (!runnerCode.includes(runnerTarget)) {
  console.error('Runner target not found!');
  process.exit(1);
}

const runnerBlock = `else if(r.type==="video-dubbing"||r.type==="dubbing"){
  const vid=(b.videos&&b.videos[0])||(b.images&&b.images[0]);
  const aud=b.audios&&b.audios[0];
  if(!vid)throw new Error(\`\${r.title} cần 1 video đầu vào (từ Veo 3 hoặc thư viện).\`);
  if(!aud)throw new Error(\`\${r.title} cần 1 file âm thanh đầu vào (từ ElevenLabs).\`);
  D(r,"AI Đang phân tích nhịp điệu & cao trào để lồng tiếng chuẩn xác...","info",{phase:"analyze"});
  v(r.id,25);
  y(r.id,{progress:25,statusText:"Đang phân tích nhịp điệu & cao trào"});
  const C=window.aiforge?.assets;
  if(!C?.syncVoiceoverVideo&&!C?.muxAudioVideo)throw new Error("Chức năng lồng tiếng video chưa khả dụng trong preload.");
  const syncFn=C.syncVoiceoverVideo||C.muxAudioVideo;
  const vidId=vid.assetId||vid.id||(typeof vid.url==="string"?vid.url.replace(/^.*\\/asset\\//,"").replace(/\\?.*$/,""):"");
  const audId=aud.assetId||aud.id||(typeof aud.url==="string"?aud.url.replace(/^.*\\/asset\\//,"").replace(/\\?.*$/,""):"");
  v(r.id,50);
  y(r.id,{progress:50,statusText:"Đang xử lý âm thanh & co giãn nhịp điệu"});
  D(r,\`Đang áp dụng bộ lọc giọng đọc: \${r.config?.mood||"Cao trào Viral (Ấm & Dày tiếng)"}\`,"info",{phase:"process"});

  const dubbed=await yo(m,de=>syncFn(vidId,audId,{
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

  if(m?.aborted)throw new Qe;
  const te=dubbed.ratio||r.config?.outputAspect||"16:9",ce=Ca(te);
  D(r,\`Video đã lồng tiếng hoàn tất với âm thanh sống động: \${dubbed.name}\`,"success",{phase:"result"});
  U.videos.push({assetId:dubbed.id,url:dubbed.url,thumbnailUrl:dubbed.thumbnailUrl,mimeType:dubbed.mimeType});
  v(r.id,95);
  y(r.id,{progress:95,statusText:"Hoàn tất lồng tiếng video",width:ce.width,height:ce.height,config:{...r.config,src:dubbed.url,outputAspect:te,outputAssets:[{type:"video",url:dubbed.url,assetId:dubbed.id,thumbnailUrl:dubbed.thumbnailUrl,mimeType:dubbed.mimeType}]}});
}
`;

if (!runnerCode.includes('r.type==="video-dubbing"')) {
  runnerCode = runnerCode.replace(runnerTarget, runnerBlock + runnerTarget);
  fs.writeFileSync(runnerFile, runnerCode, 'utf8');
  console.log('✓ Patched useWorkflowRunner-BmcV20yZ.js successfully!');
} else {
  console.log('Runner already patched.');
}

// 2. PATCH WorkflowEditor-BFJj-KsD.js
const editorFile = path.join(__dirname, '../app/out/renderer/assets/WorkflowEditor-BFJj-KsD.js');
let editorCode = fs.readFileSync(editorFile, 'utf8');

// 2.1 Allowed types for input video & audio
// video: new Set([..., "video-script-extract", "video-dubbing"])
if (!editorCode.includes('"video-dubbing"')) {
  editorCode = editorCode.replace(
    'video:new Set(["http-request","browser-request","download","delay","loop","condition","merge","select-item","video-script-extract"])',
    'video:new Set(["http-request","browser-request","download","delay","loop","condition","merge","select-item","video-script-extract","video-dubbing"])'
  );
  editorCode = editorCode.replace(
    'audio:new Set(["http-request","browser-request","download","delay","loop","condition","merge","select-item"])',
    'audio:new Set(["http-request","browser-request","download","delay","loop","condition","merge","select-item","video-dubbing"])'
  );

  // 2.2 Output connections
  editorCode = editorCode.replace(
    'video:new Set(["google-flow","grok","delay","condition","video-script-extract"])',
    'video:new Set(["google-flow","grok","delay","condition","video-script-extract","video-dubbing"])'
  );
  editorCode = editorCode.replace(
    'audio:new Set(["chatgpt-synthesize","elevenlabs","delay","condition"])',
    'audio:new Set(["chatgpt-synthesize","elevenlabs","delay","condition","video-dubbing"])'
  );

  // 2.3 Node instantiation in createNode
  const nodeDef = `case "video-dubbing":return{id:r,type:"video-dubbing",title:"Lồng Tiếng & Đồng Bộ Video",x:s,y:n,width:400,height:290,enabled:!0,active:!0,inputs:[{id:\`\${r}-in-vid\`,type:"video",label:"Video Veo 3"},{id:\`\${r}-in-aud\`,type:"audio",label:"Voice ElevenLabs"}],outputs:[{id:\`\${r}-out-vid\`,type:"video",label:"Video Hoàn Thành"}],config:{speedMode:"auto",customSpeed:1,mood:"viral_climax",intensity:1,voiceVolume:100,removeOriginalAudio:!0}};`;
  editorCode = editorCode.replace('case"video-script-extract":', nodeDef + 'case"video-script-extract":');

  // 2.4 Output assets preview allowance
  editorCode = editorCode.replace(
    '||e.type==="video-script-extract"',
    '||e.type==="video-script-extract"||e.type==="video-dubbing"'
  );

  // 2.5 Icon rendering
  const iconDef = `case "video-dubbing":return t.jsx("div",{className:\`\${n} rounded-lg bg-[#8b5cf6]/15 text-[#a78bfa]\`,title:"Lồng Tiếng & Đồng Bộ Video",children:t.jsx(Id,{size:14})});`;
  editorCode = editorCode.replace('case"video-script-extract":', iconDef + 'case"video-script-extract":');

  // 2.6 Border style
  editorCode = editorCode.replace(
    'case"video-script-extract":return"border-[#10b981] shadow-[0_0_20px_rgba(16,185,129,0.35)]";',
    'case"video-dubbing":return"border-[#8b5cf6] shadow-[0_0_20px_rgba(139,92,246,0.35)]";case"video-script-extract":return"border-[#10b981] shadow-[0_0_20px_rgba(16,185,129,0.35)]";'
  );

  // 2.7 Card Body UI
  const cardBody = `e.type==="video-dubbing"&&t.jsxs("div",{className:"flex-1 flex flex-col gap-2 p-2.5 bg-[#170e2b40] border border-purple-500/20 rounded-lg min-h-0 overflow-y-auto scrollbar-thin text-left select-none",children:[t.jsxs("div",{className:"text-[11px] text-text-muted flex justify-between items-center",children:[t.jsx("span",{children:"Tác vụ:"}),t.jsx("span",{className:"font-semibold text-purple-300 bg-purple-500/15 px-2 py-0.5 rounded border border-purple-500/30 text-[10px]",children:"Lồng tiếng & Đồng bộ AI"})]}),t.jsxs("div",{className:"flex flex-col gap-1",children:[t.jsx("label",{className:"text-[10px] text-purple-300 font-medium",children:"Phong cách cao trào & Âm sắc:"}),t.jsxs("select",{value:e.config?.mood||"viral_climax",onChange:pe=>{pe.stopPropagation(),f(e.id,{...e.config,mood:pe.target.value})},className:"nowheel nopan nodrag w-full bg-white/5 text-[11px] text-text-primary px-2 py-1 rounded border border-white/10 outline-none focus:border-purple-400/50 cursor-pointer",children:[t.jsx("option",{value:"viral_climax",className:"bg-[#130f24] text-white",children:"🔥 Cao trào Viral (Ấm & Dày tiếng)"}),t.jsx("option",{value:"broadcast",className:"bg-[#130f24] text-white",children:"🎙️ Chuẩn Studio / Phát Thanh"}),t.jsx("option",{value:"sales_punch",className:"bg-[#130f24] text-white",children:"⚡ Bán Hàng / Năng Lượng Cao"}),t.jsx("option",{value:"crisp",className:"bg-[#130f24] text-white",children:"🌟 Trong Trẻo / Sáng Tiếng"}),t.jsx("option",{value:"natural",className:"bg-[#130f24] text-white",children:"🌿 Tự Nhiên (Gốc ElevenLabs)"})]})]}),t.jsxs("div",{className:"flex flex-col gap-1",children:[t.jsxs("div",{className:"flex justify-between items-center",children:[t.jsx("label",{className:"text-[10px] text-text-muted font-medium",children:"Tốc độ & Nhịp điệu:"}),t.jsx("span",{className:"text-[9px] text-purple-400 font-mono",children:e.config?.speedMode==="custom"?\`\${e.config?.customSpeed||1}x (Thủ công)\`:"Tự động khớp Video"})]}),t.jsxs("div",{className:"flex gap-1 bg-white/5 p-0.5 rounded border border-white/5 text-[10px]",children:[t.jsx("button",{type:"button",onClick:pe=>{pe.stopPropagation(),f(e.id,{...e.config,speedMode:"auto"})},className:\`flex-1 py-0.5 rounded \${e.config?.speedMode!=="custom"?"bg-purple-500/30 text-purple-200 font-medium":"text-text-muted hover:text-white"}\`,children:"Auto-Fit Video"}),t.jsx("button",{type:"button",onClick:pe=>{pe.stopPropagation(),f(e.id,{...e.config,speedMode:"custom",customSpeed:e.config?.customSpeed||1})},className:\`flex-1 py-0.5 rounded \${e.config?.speedMode==="custom"?"bg-purple-500/30 text-purple-200 font-medium":"text-text-muted hover:text-white"}\`,children:"Thủ công"})]}),e.config?.speedMode==="custom"&&t.jsx("input",{type:"range",min:.5,max:2,step:.05,value:e.config?.customSpeed||1,onChange:pe=>{pe.stopPropagation(),f(e.id,{...e.config,customSpeed:parseFloat(pe.target.value)})},className:"nowheel nopan nodrag w-full accent-purple-500 cursor-pointer h-1 bg-white/10 rounded mt-1"})]}),t.jsxs("div",{className:"flex items-center justify-between pt-1 border-t border-white/5",children:[t.jsxs("label",{className:"flex items-center gap-1.5 cursor-pointer text-[10px] text-text-muted hover:text-white",children:[t.jsx("input",{type:"checkbox",checked:e.config?.removeOriginalAudio!==!1,onChange:pe=>{pe.stopPropagation(),f(e.id,{...e.config,removeOriginalAudio:pe.target.checked})},className:"accent-purple-500 rounded cursor-pointer"}),t.jsx("span",{children:"Xóa 100% tiếng gốc"})]}),t.jsxs("span",{className:"text-[9px] text-purple-300 font-mono",children:[\`Voice: \${e.config?.voiceVolume||100}%\`]})]}),t.jsxs("button",{type:"button",onClick:fe=>{fe.stopPropagation(),M(e.id)},className:"w-full mt-1 py-1.5 px-2.5 rounded-md bg-purple-500/25 hover:bg-purple-500/35 active:scale-98 border border-purple-500/35 text-purple-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm",children:[t.jsx(At,{size:12,className:"fill-current"}),"Lồng tiếng video ngay"]})]}),`;

  editorCode = editorCode.replace(
    ',e.type==="text-splitter"&&t.jsxs',
    ',' + cardBody + 'e.type==="text-splitter"&&t.jsxs'
  );

  // 2.8 Catalog item in Add Node modal
  const catalogItem = `{type:"video-dubbing",title:"Lồng Tiếng & Đồng Bộ Video",desc:"Nhận Video Veo 3 và Voice ElevenLabs, tự động phân tích nhịp điệu, cao trào và lồng tiếng hoàn chỉnh"},`;
  editorCode = editorCode.replace('{type:"video-script-extract",', catalogItem + '{type:"video-script-extract",');

  fs.writeFileSync(editorFile, editorCode, 'utf8');
  console.log('✓ Patched WorkflowEditor-BFJj-KsD.js successfully!');
} else {
  console.log('WorkflowEditor already patched.');
}
