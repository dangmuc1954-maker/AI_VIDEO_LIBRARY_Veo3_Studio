const fs = require('fs');
const path = require('path');

console.log('=== NÂNG CẤP GIAO DIỆN NODE LỒNG TIẾNG & ĐỒNG BỘ VIDEO TRÊN CANVAS ===');

const targetRoots = [
  path.join(__dirname, '../app'),
  path.join('C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app')
];

// Tạo Card Body mới đẳng cấp, trực quan và chống lỗi 100%
const newCardBody = `e.type==="video-dubbing"&&t.jsxs("div",{className:"flex-1 flex flex-col gap-2 p-2.5 bg-[#170e2b50] border border-purple-500/25 rounded-lg min-h-0 overflow-y-auto scrollbar-thin text-left select-none",children:[
  t.jsxs("div",{className:"text-[11px] text-text-muted flex justify-between items-center",children:[
    t.jsxs("div",{className:"flex items-center gap-1.5",children:[
      t.jsx("span",{className:"w-2 h-2 rounded-full bg-purple-400 animate-pulse"}),
      t.jsx("span",{className:"font-bold text-purple-300 text-[10px] uppercase tracking-wider",children:"Lồng tiếng & Đồng bộ AI"})
    ]}),
    t.jsx("span",{className:"text-[9px] px-1.5 py-0.2 rounded bg-purple-500/15 border border-purple-500/30 text-purple-200 font-mono",children:"Veo 3 ⨉ ElevenLabs"})
  ]}),

  // Dropdown chọn phong cách ngữ điệu & âm sắc
  t.jsxs("div",{className:"flex flex-col gap-1",children:[
    t.jsx("label",{className:"text-[10px] text-purple-200 font-semibold flex items-center gap-1",children:[
      "🎭 Ngữ điệu & Âm sắc nhân vật:"
    ]}),
    t.jsxs("select",{value:e.config?.mood||"viral_climax",onChange:pe=>{pe.stopPropagation(),h?.(e.id,{...e.config,mood:pe.target.value})},className:"nowheel nopan nodrag w-full bg-[#130f24] text-[11px] text-text-primary px-2 py-1.5 rounded-md border border-purple-500/30 outline-none focus:border-purple-400 cursor-pointer shadow-inner",children:[
      t.jsx("option",{value:"viral_climax",className:"bg-[#130f24] text-white",children:"🔥 Cao trào Viral (Ấm, Dày & Nén chuẩn TikTok)"}),
      t.jsx("option",{value:"dramatic",className:"bg-[#130f24] text-white",children:"🎬 Kịch tính / Điện ảnh (Cảm xúc & Chiều sâu)"}),
      t.jsx("option",{value:"broadcast",className:"bg-[#130f24] text-white",children:"🎙️ Chuẩn Studio / Phát thanh (Rõ nét, Truyền cảm)"}),
      t.jsx("option",{value:"sales_punch",className:"bg-[#130f24] text-white",children:"⚡ Bán hàng / Năng lượng cao (Nảy tiếng & Dứt khoát)"}),
      t.jsx("option",{value:"natural",className:"bg-[#130f24] text-white",children:"🌿 Tự nhiên (Giữ nguyên âm sắc ElevenLabs gốc)"})
    ]})
  ]}),

  // Nhịp điệu & Co giãn tốc độ khớp Video
  t.jsxs("div",{className:"flex flex-col gap-1 bg-white/[0.03] p-1.5 rounded border border-white/5",children:[
    t.jsxs("div",{className:"flex justify-between items-center",children:[
      t.jsx("label",{className:"text-[10px] text-text-muted font-medium",children:"⏱️ Nhịp điệu & Tốc độ:"}),
      t.jsx("span",{className:"text-[9px] text-purple-300 font-mono font-semibold",children:e.config?.speedMode==="custom"?\`\${e.config?.customSpeed||1}x (Thủ công)\`:e.config?.speedMode==="keep_original"?"Giữ nguyên voice gốc":"Auto-Fit (Khớp Video)"})
    ]}),
    t.jsxs("div",{className:"flex gap-1 bg-[#130f2480] p-0.5 rounded border border-white/5 text-[9px]",children:[
      t.jsx("button",{type:"button",onClick:pe=>{pe.stopPropagation(),h?.(e.id,{...e.config,speedMode:"auto"})},className:\`flex-1 py-1 rounded \${e.config?.speedMode!=="custom"&&e.config?.speedMode!=="keep_original"?"bg-purple-500 text-white font-bold shadow":"text-text-muted hover:text-white"}\`,children:"Auto-Fit"}),
      t.jsx("button",{type:"button",onClick:pe=>{pe.stopPropagation(),h?.(e.id,{...e.config,speedMode:"keep_original"})},className:\`flex-1 py-1 rounded \${e.config?.speedMode==="keep_original"?"bg-purple-500 text-white font-bold shadow":"text-text-muted hover:text-white"}\`,children:"Gốc"}),
      t.jsx("button",{type:"button",onClick:pe=>{pe.stopPropagation(),h?.(e.id,{...e.config,speedMode:"custom",customSpeed:e.config?.customSpeed||1})},className:\`flex-1 py-1 rounded \${e.config?.speedMode==="custom"?"bg-purple-500 text-white font-bold shadow":"text-text-muted hover:text-white"}\`,children:"Thủ công"})
    ]}),
    e.config?.speedMode==="custom"&&t.jsxs("div",{className:"flex items-center gap-2 pt-0.5",children:[
      t.jsx("input",{type:"range",min:.5,max:2,step:.05,value:e.config?.customSpeed||1,onChange:pe=>{pe.stopPropagation(),h?.(e.id,{...e.config,customSpeed:parseFloat(pe.target.value)})},className:"nowheel nopan nodrag flex-1 accent-purple-500 cursor-pointer h-1 bg-white/10 rounded"}),
      t.jsx("span",{className:"text-[9px] text-purple-300 font-mono w-7 text-right",children:\`\${e.config?.customSpeed||1}x\`})
    ]})
  ]}),

  // Cấu hình âm thanh gốc & Smart Ducking
  t.jsxs("div",{className:"flex flex-col gap-1 bg-white/[0.03] p-1.5 rounded border border-white/5",children:[
    t.jsxs("div",{className:"flex items-center justify-between",children:[
      t.jsxs("label",{className:"flex items-center gap-1.5 cursor-pointer text-[10px] text-text-muted hover:text-white",children:[
        t.jsx("input",{type:"checkbox",checked:e.config?.removeOriginalAudio!==!1&&!e.config?.keepBackgroundMusic,onChange:pe=>{pe.stopPropagation(),h?.(e.id,{...e.config,removeOriginalAudio:pe.target.checked,keepBackgroundMusic:!pe.target.checked})},className:"accent-purple-500 rounded cursor-pointer"}),
        t.jsx("span",{children:"Tắt sạch tiếng gốc"})
      ]}),
      t.jsxs("label",{className:"flex items-center gap-1.5 cursor-pointer text-[10px] text-text-muted hover:text-white",children:[
        t.jsx("input",{type:"checkbox",checked:!!e.config?.keepBackgroundMusic,onChange:pe=>{pe.stopPropagation(),h?.(e.id,{...e.config,keepBackgroundMusic:pe.target.checked,removeOriginalAudio:!pe.target.checked})},className:"accent-purple-500 rounded cursor-pointer"}),
        t.jsx("span",{children:"Giữ nhạc nền (Ducking)"})
      ]})
    ]}),
    t.jsxs("div",{className:"flex items-center justify-between pt-1 border-t border-white/5 text-[9px]",children:[
      t.jsx("span",{className:"text-text-muted",children:"Âm lượng Voice:"}),
      t.jsxs("div",{className:"flex items-center gap-2",children:[
        t.jsx("input",{type:"range",min:50,max:200,step:5,value:e.config?.voiceVolume||100,onChange:pe=>{pe.stopPropagation(),h?.(e.id,{...e.config,voiceVolume:parseInt(pe.target.value,10)})},className:"nowheel nopan nodrag w-24 accent-purple-500 cursor-pointer h-1 bg-white/10 rounded"}),
        t.jsx("span",{className:"text-purple-300 font-mono w-8 text-right",children:\`\${e.config?.voiceVolume||100}%\`})
      ]})
    ]})
  ]}),

  // Video Player Preview nếu đã có video kết quả
  Dt&&t.jsxs("div",{className:"flex flex-col gap-1 mt-0.5",children:[
    t.jsxs("div",{className:"flex items-center justify-between",children:[
      t.jsx("span",{className:"text-[9px] text-emerald-400 font-bold flex items-center gap-1",children:["✓ Video lồng tiếng thành công"]}),
      t.jsx("a",{href:Dt,target:"_blank",rel:"noreferrer",className:"text-[9px] text-purple-300 hover:text-white underline",onClick:pe=>pe.stopPropagation(),children:"Mở video"})
    ]}),
    t.jsx("video",{src:Dt,controls:!0,preload:"metadata",className:"nowheel nopan nodrag w-full max-h-36 rounded-md bg-black object-contain border border-purple-500/40 shadow-md",onClick:pe=>pe.stopPropagation()})
  ]}),

  // Nút thực thi chính
  t.jsxs("button",{type:"button",onClick:async fe=>{
    fe.stopPropagation();
    if(re) return;
    try {
      // Ưu tiên chạy qua Workflow Runner nếu có hàm P
      if(typeof P==="function"){
        P(e.id);
        return;
      }
      const C=window.aiforge?.assets;
      if(!C) throw new Error("Chưa kết nối Asset Bridge.");
      const allAssets=await C.list();
      const validVideos=allAssets.filter(a=>a.type==="video");
      const validAudios=allAssets.filter(a=>a.type==="audio");
      if(validVideos.length===0) throw new Error("Vui lòng kết nối 1 Video từ Veo 3 vào node này!");
      if(validAudios.length===0) throw new Error("Vui lòng kết nối 1 Voice từ ElevenLabs vào node này!");
      fe.currentTarget.innerText="⏳ Đang phân tích & lồng tiếng...";
      const lastVid=validVideos[validVideos.length-1];
      const lastAud=validAudios[validAudios.length-1];
      const res=await (C.syncVoiceoverVideo||C.muxAudioVideo)(lastVid.id,lastAud.id,{
        mood:e.config?.mood||"viral_climax",
        speedMode:e.config?.speedMode||"auto",
        customSpeed:e.config?.customSpeed||1,
        voiceVolume:e.config?.voiceVolume||100,
        removeOriginalAudio:e.config?.removeOriginalAudio!==!1&&!e.config?.keepBackgroundMusic,
        keepBackgroundMusic:e.config?.keepBackgroundMusic===!0
      });
      if(res?.url){
        h?.(e.id,{...e.config,src:res.url,outputAssets:[{type:"video",url:res.url,assetId:res.id,thumbnailUrl:res.thumbnailUrl,mimeType:res.mimeType}]});
        alert("✨ Lồng tiếng và đồng bộ video thành công!");
      }
    } catch(err) {
      alert("Lỗi lồng tiếng: "+(err.message||err));
    } finally {
      fe.currentTarget.innerText="🎙️ Lồng tiếng & Đồng bộ AI ngay";
    }
  },disabled:re,className:\`w-full mt-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md \${re?"bg-purple-600/40 text-purple-200 cursor-not-allowed animate-pulse":"bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white active:scale-98 shadow-[0_0_15px_rgba(147,51,234,0.35)]"}\`,children:[
    t.jsx(At,{size:13,className:\`fill-current \${re?"animate-spin":""}\`}),
    re?(e.statusText||"Đang lồng tiếng & co giãn nhịp..."):Dt?"Lồng tiếng lại video":"🎙️ Lồng tiếng & Đồng bộ AI ngay"
  ]})
]}),`;

for (const root of targetRoots) {
  if (!fs.existsSync(root)) continue;
  const editorPath = path.join(root, 'out/renderer/assets/WorkflowEditor-LHGC9K3C.js');
  if (!fs.existsSync(editorPath)) continue;

  console.log('[*] Đang cập nhật:', editorPath);
  let code = fs.readFileSync(editorPath, 'utf8');

  const startMarker = 'e.type==="video-dubbing"&&t.jsxs("div",{className:"flex-1 flex flex-col gap-2 p-2.5 bg-[#170e2b40]';
  const startIdx = code.indexOf(startMarker);
  if (startIdx !== -1) {
    const endMarker = 'e.type==="text-splitter"&&t.jsxs(';
    const endIdx = code.indexOf(endMarker, startIdx);
    if (endIdx !== -1) {
      code = code.substring(0, startIdx) + newCardBody + code.substring(endIdx);
      fs.writeFileSync(editorPath, code, 'utf8');
      console.log('  ✓ Đã cập nhật UI Card Body cho WorkflowEditor-LHGC9K3C.js thành công!');
    }
  }
}
