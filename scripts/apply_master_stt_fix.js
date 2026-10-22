const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

// ============================================================================
// 1. CẬP NHẬT MAIN/INDEX.JS: WHISPER TỰ ĐỘNG NHẬN DIỆN TIẾNG VIỆT & TIẾNG ANH
// ============================================================================
console.log('[1/3] Cập nhật main/index.js...');
const mainPath = path.join(rootDir, 'app/out/main/index.js');
let mainCode = fs.readFileSync(mainPath, 'utf8');

// Thay đổi language cứng thành auto-detect
mainCode = mainCode.replace(
  'language: "vietnamese",\n        task: "transcribe",\n        sampling_rate: 16000',
  'task: "transcribe",\n        sampling_rate: 16000'
);
mainCode = mainCode.replace(
  'language: "vietnamese", task: "transcribe", sampling_rate: 16000',
  'task: "transcribe", sampling_rate: 16000'
);

fs.writeFileSync(mainPath, mainCode, 'utf8');
console.log('  ✓ Main index.js đã được cấu hình Whisper auto-detect đa ngôn ngữ');

// ============================================================================
// 2. CẬP NHẬT WORKFLOW RUNNER: TRUYỀN TEXT CHUẨN XÁC 100% SANG ELEVENLABS
// ============================================================================
console.log('\n[2/3] Cập nhật useWorkflowRunner-DGw6Ekx4.js...');
const runnerPath = path.join(rootDir, 'app/out/renderer/assets/useWorkflowRunner-DGw6Ekx4.js');
let runnerCode = fs.readFileSync(runnerPath, 'utf8');

// Thay thế đoạn runner của video-script-extract với cơ chế fallback thông minh
const oldSttRunnerRegex = /else if\(r\.type==="video-script-extract"\|\|r\.type==="stt"\)\{[\s\S]*?z\(r,`Đã chuyển âm thanh sang văn bản \(\$\{res\.duration\}s\): "\$\{sText\}"`,"success",\{phase:"result"\}\);\s*\}/;

const newSttRunner = `else if(r.type==="video-script-extract"||r.type==="stt"){
  let sText = r.config?.outputText?.trim();
  let vid = (k.videos && k.videos[0]) || (k.images && k.images[0]);

  // Nếu chưa có video từ k, quét ngược lại các kết quả đã chạy trong workflow
  if (!vid) {
    for (const [nodeId, nodeVal] of u.entries()) {
      if (nodeVal?.videos && nodeVal.videos.length > 0) {
        vid = nodeVal.videos[0];
        break;
      }
    }
  }

  // Nếu đã có sẵn kịch bản (do anh Tris đã gõ hoặc đã bấm bóc trước đó)
  if (sText) {
    z(r, \`Sử dụng kịch bản lời thoại có sẵn: "\${sText}"\`, "info", { phase: "extract" });
    H.text = sText;
    H.texts = [sText];
    if (vid) H.videos = [vid];
    x(r.id, 100);
    y(r.id, { progress: 100, statusText: "Kịch bản sẵn sàng", config: { ...r.config, outputText: sText } });
    z(r, \`Đã nạp kịch bản lời thoại sẵn sàng cho ElevenLabs: "\${sText}"\`, "success", { phase: "result" });
  } else {
    if (!vid) throw new Error(\`\${r.title} cần 1 video đầu vào từ Google Flow (hoặc bấm nút "Bóc kịch bản ngay" trên thẻ).\`);
    z(r, "Đang lắng nghe âm thanh video và chuyển thành văn bản chuẩn...", "info", { phase: "extract" });
    x(r.id, 30);
    y(r.id, { progress: 30, statusText: "Đang chuyển âm thanh sang văn bản" });
    const C = window.aiforge?.assets;
    if (!C?.transcribeVideoAudio) throw new Error("Chức năng chuyển âm thanh sang văn bản chưa khả dụng trong preload.");
    const vidId = vid.assetId || vid.id || (typeof vid.url === "string" ? vid.url.replace(/^.*\\/asset\\//, "").replace(/\\?.*$/, "") : "");
    const res = await Is(w, de => C.transcribeVideoAudio(vidId, { operationId: de }), C.cancelMerge);
    if (w?.aborted) throw new Ze;
    sText = res.script?.trim();
    if (!sText) throw new Error("Không phát hiện được lời thoại trong âm thanh của video.");
    H.text = sText;
    H.texts = [sText];
    H.videos = [vid];
    x(r.id, 100);
    y(r.id, { progress: 100, statusText: "Đã bóc kịch bản thành công", config: { ...r.config, outputText: sText, duration: res.duration } });
    z(r, \`Đã bóc kịch bản lời thoại (\${res.duration}s) đưa sang ElevenLabs: "\${sText}"\`, "success", { phase: "result" });
  }
}`;

if (oldSttRunnerRegex.test(runnerCode)) {
  runnerCode = runnerCode.replace(oldSttRunnerRegex, newSttRunner);
  fs.writeFileSync(runnerPath, runnerCode, 'utf8');
  console.log('  ✓ Đã cập nhật runner cho node Đọc Kịch Bản');
} else {
  console.log('  [-] Không tìm thấy oldSttRunnerRegex, kiểm tra lại.');
}

// ============================================================================
// 3. CẬP NHẬT WORKFLOW EDITOR: NÚT BÓC KỊCH BẢN TRỰC TIẾP & BẬT TIẾNG VIDEO
// ============================================================================
console.log('\n[3/3] Cập nhật WorkflowEditor-LHGC9K3C.js...');
const editorPath = path.join(rootDir, 'app/out/renderer/assets/WorkflowEditor-LHGC9K3C.js');
let editorCode = fs.readFileSync(editorPath, 'utf8');

// 3a. Sửa nút M(e.id) và hàm update config f(...) trong Card Body
const oldCardBodyRegex = /e\.type==="video-script-extract"&&t\.jsxs\("div",\{className:"flex-1 flex flex-col gap-2 p-2 bg-\[#130f2440\][\s\S]*?e\.type==="video-dubbing"&&t\.jsxs\("div",\{className:"flex-1 flex flex-col gap-2 p-2\.5 bg-\[#170e2b40\][\s\S]*?Lồng tiếng video ngay"\]\}\)\]\}\),/;

const newCardBodies = `e.type==="video-script-extract"&&t.jsxs("div",{className:"flex-1 flex flex-col gap-2 p-2 bg-[#130f2440] border border-white/5 rounded-lg min-h-0 overflow-y-auto scrollbar-thin text-left select-none",children:[t.jsxs("div",{className:"text-[11px] text-text-muted flex justify-between items-center",children:[t.jsx("span",{children:"Tác vụ:"}),t.jsx("span",{className:"font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 text-[10px]",children:"Âm thanh → Văn bản"})]}),e.config?.outputText?t.jsxs("div",{className:"mt-1 border-t border-white/5 pt-1.5 flex flex-col gap-1.5",children:[t.jsxs("div",{className:"flex justify-between items-center select-none",children:[t.jsx("span",{className:"text-[10px] text-emerald-400 font-bold uppercase",children:"Kịch bản lời thoại (gõ sửa hoặc đưa sang ElevenLabs):"}),t.jsxs("div",{className:"flex items-center gap-2",children:[e.config?.duration&&t.jsx("span",{className:"text-[9px] text-text-muted font-mono",children:\`\${e.config.duration}s\`}),t.jsx("button",{type:"button",onClick:async fe=>{fe.stopPropagation();try{const C=window.aiforge?.assets;const allAssets=await C?.list?.();const lastVid=allAssets?.filter?.(a=>a.type==="video")?.slice(-1)[0];if(!lastVid)return alert("Chưa có video nào để bóc kịch bản!");const res=await C?.transcribeVideoAudio?.(lastVid.id);if(res?.script){h?.(e.id,{...e.config,outputText:res.script,duration:res.duration})}}catch(err){alert("Lỗi bóc kịch bản: "+(err.message||err))}},className:"text-[9px] text-emerald-300 hover:text-emerald-200 underline cursor-pointer",children:"Nhận diện lại"})]})]}),t.jsx("textarea",{rows:3,value:e.config.outputText,onChange:pe=>{pe.stopPropagation(),h?.(e.id,{...e.config,outputText:pe.target.value})},className:"nowheel nopan nodrag w-full text-[11px] text-text-primary bg-white/5 p-2 rounded border border-white/10 outline-none focus:border-emerald-400/50 resize-y leading-relaxed font-sans select-text",placeholder:"Kịch bản lời thoại..."})]}):t.jsxs("div",{className:"flex flex-col gap-1.5 mt-0.5",children:[t.jsx("div",{className:"text-[10px] text-text-muted italic leading-snug",children:"Nối Video Veo 3 vào node này rồi bấm nút bên dưới để bóc kịch bản:"}),t.jsxs("button",{type:"button",onClick:async fe=>{fe.stopPropagation();try{const C=window.aiforge?.assets;const allAssets=await C?.list?.();const lastVid=allAssets?.filter?.(a=>a.type==="video")?.slice(-1)[0];if(!lastVid)return alert("Chưa có video nào để bóc kịch bản!");fe.target.innerText="⏳ Đang lắng nghe...";const res=await C?.transcribeVideoAudio?.(lastVid.id);if(res?.script){h?.(e.id,{...e.config,outputText:res.script,duration:res.duration})}}catch(err){alert("Lỗi bóc kịch bản: "+(err.message||err))}finally{fe.target.innerText="▶ Bóc kịch bản ngay"}},className:"w-full py-1.5 px-2.5 rounded-md bg-emerald-500/20 hover:bg-emerald-500/30 active:scale-98 border border-emerald-500/30 text-emerald-300 hover:text-emerald-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm",children:[t.jsx(At,{size:12,className:"fill-current"})," Bóc kịch bản ngay"]})]})]}),e.type==="video-dubbing"&&t.jsxs("div",{className:"flex-1 flex flex-col gap-2 p-2.5 bg-[#170e2b40] border border-purple-500/20 rounded-lg min-h-0 overflow-y-auto scrollbar-thin text-left select-none",children:[t.jsxs("div",{className:"text-[11px] text-text-muted flex justify-between items-center",children:[t.jsx("span",{children:"Tác vụ:"}),t.jsx("span",{className:"font-semibold text-purple-300 bg-purple-500/15 px-2 py-0.5 rounded border border-purple-500/30 text-[10px]",children:"Lồng tiếng & Đồng bộ AI"})]}),t.jsxs("div",{className:"flex flex-col gap-1",children:[t.jsx("label",{className:"text-[10px] text-purple-300 font-medium",children:"Phong cách cao trào & Âm sắc:"}),t.jsxs("select",{value:e.config?.mood||"viral_climax",onChange:pe=>{pe.stopPropagation(),h?.(e.id,{...e.config,mood:pe.target.value})},className:"nowheel nopan nodrag w-full bg-white/5 text-[11px] text-text-primary px-2 py-1 rounded border border-white/10 outline-none focus:border-purple-400/50 cursor-pointer",children:[t.jsx("option",{value:"viral_climax",className:"bg-[#130f24] text-white",children:"🔥 Cao trào Viral (Ấm & Dày tiếng)"}),t.jsx("option",{value:"broadcast",className:"bg-[#130f24] text-white",children:"🎙️ Chuẩn Studio / Phát Thanh"}),t.jsx("option",{value:"sales_punch",className:"bg-[#130f24] text-white",children:"⚡ Bán Hàng / Năng Lượng Cao"}),t.jsx("option",{value:"crisp",className:"bg-[#130f24] text-white",children:"🌟 Trong Trẻo / Sáng Tiếng"}),t.jsx("option",{value:"natural",className:"bg-[#130f24] text-white",children:"🌿 Tự Nhiên (Gốc ElevenLabs)"})]})]}),t.jsxs("div",{className:"flex flex-col gap-1",children:[t.jsxs("div",{className:"flex justify-between items-center",children:[t.jsx("label",{className:"text-[10px] text-text-muted font-medium",children:"Tốc độ & Nhịp điệu:"}),t.jsx("span",{className:"text-[9px] text-purple-400 font-mono",children:e.config?.speedMode==="custom"?\`\${e.config?.customSpeed||1}x (Thủ công)\`:"Tự động khớp Video"})]}),t.jsxs("div",{className:"flex gap-1 bg-white/5 p-0.5 rounded border border-white/5 text-[10px]",children:[t.jsx("button",{type:"button",onClick:pe=>{pe.stopPropagation(),h?.(e.id,{...e.config,speedMode:"auto"})},className:\`flex-1 py-0.5 rounded \${e.config?.speedMode!=="custom"?"bg-purple-500/30 text-purple-200 font-medium":"text-text-muted hover:text-white"}\`,children:"Auto-Fit Video"}),t.jsx("button",{type:"button",onClick:pe=>{pe.stopPropagation(),h?.(e.id,{...e.config,speedMode:"custom",customSpeed:e.config?.customSpeed||1})},className:\`flex-1 py-0.5 rounded \${e.config?.speedMode==="custom"?"bg-purple-500/30 text-purple-200 font-medium":"text-text-muted hover:text-white"}\`,children:"Thủ công"})]}),e.config?.speedMode==="custom"&&t.jsx("input",{type:"range",min:.5,max:2,step:.05,value:e.config?.customSpeed||1,onChange:pe=>{pe.stopPropagation(),h?.(e.id,{...e.config,customSpeed:parseFloat(pe.target.value)})},className:"nowheel nopan nodrag w-full accent-purple-500 cursor-pointer h-1 bg-white/10 rounded mt-1"})]}),t.jsxs("div",{className:"flex items-center justify-between pt-1 border-t border-white/5",children:[t.jsxs("label",{className:"flex items-center gap-1.5 cursor-pointer text-[10px] text-text-muted hover:text-white",children:[t.jsx("input",{type:"checkbox",checked:e.config?.removeOriginalAudio!==!1,onChange:pe=>{pe.stopPropagation(),h?.(e.id,{...e.config,removeOriginalAudio:pe.target.checked})},className:"accent-purple-500 rounded cursor-pointer"}),t.jsx("span",{children:"Xóa 100% tiếng gốc"})]}),t.jsxs("span",{className:"text-[9px] text-purple-300 font-mono",children:[\`Voice: \${e.config?.voiceVolume||100}%\`]})]}),t.jsxs("button",{type:"button",onClick:async fe=>{fe.stopPropagation();try{const C=window.aiforge?.assets;const allAssets=await C?.list?.();const lastVid=allAssets?.filter?.(a=>a.type==="video")?.slice(-1)[0];const lastAud=allAssets?.filter?.(a=>a.type==="audio")?.slice(-1)[0];if(!lastVid||!lastAud)return alert("Cần có cả video và voice audio để lồng tiếng!");fe.target.innerText="⏳ Đang lồng tiếng...";const res=await (C.syncVoiceoverVideo||C.muxAudioVideo)(lastVid.id,lastAud.id,{mood:e.config?.mood||"viral_climax",speedMode:e.config?.speedMode||"auto",customSpeed:e.config?.customSpeed||1,voiceVolume:e.config?.voiceVolume||100,removeOriginalAudio:e.config?.removeOriginalAudio!==!1});if(res?.url){h?.(e.id,{...e.config,src:res.url,outputAssets:[{type:"video",url:res.url,assetId:res.id,thumbnailUrl:res.thumbnailUrl,mimeType:res.mimeType}]});alert("Đã lồng tiếng video thành công!");}}catch(err){alert("Lỗi lồng tiếng: "+(err.message||err))}finally{fe.target.innerText="Lồng tiếng video ngay"}},className:"w-full mt-1 py-1.5 px-2.5 rounded-md bg-purple-500/25 hover:bg-purple-500/35 active:scale-98 border border-purple-500/35 text-purple-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm",children:[t.jsx(At,{size:12,className:"fill-current"}),"Lồng tiếng video ngay"]})]}),`;

if (oldCardBodyRegex.test(editorCode)) {
  editorCode = editorCode.replace(oldCardBodyRegex, newCardBodies);
  console.log('  ✓ Đã cập nhật Card Bodies thông minh với nút bấm trực tiếp và hàm h?.(e.id)');
} else {
  console.log('  [-] Không khớp oldCardBodyRegex, thử thay thế chính xác block');
  const anchor = 'e.type==="video-script-extract"&&t.jsxs("div"';
  const endAnchor = 'Lồng tiếng video ngay"]})]}),';
  const aIdx = editorCode.indexOf(anchor);
  const bIdx = editorCode.indexOf(endAnchor, aIdx);
  if (aIdx !== -1 && bIdx !== -1) {
    editorCode = editorCode.slice(0, aIdx) + newCardBodies + editorCode.slice(bIdx + endAnchor.length);
    console.log('  ✓ Đã thay thế thành công Card Bodies bằng substring slice');
  }
}

// 3b. Bật tiếng cho video preview trên canvas (bỏ muted:!0)
editorCode = editorCode.replace(
  'autoPlay:!0,muted:!0,loop:!0,playsInline:!0,preload:"auto",onCanPlay:F=>{F.currentTarget.play()},onError:()=>Ce(!1),className:"h-full w-full rounded-lg object-cover pointer-events-none"',
  'controls:!0,autoPlay:!1,loop:!0,playsInline:!0,preload:"metadata",className:"h-full w-full rounded-lg object-cover"'
);

fs.writeFileSync(editorPath, editorCode, 'utf8');
console.log('  ✓ Đã lưu WorkflowEditor-LHGC9K3C.js thành công');
