const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== FIXING VIDEO STUDIO SYNTAX ERROR ===');

const targetRoots = [
  path.join(__dirname, '../app'),
  path.join(__dirname, '../extracted_original'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Customer_Edition/resources/app')
];

// Clean, perfectly formatted top toolbar banner
const topToolbarBanner = `e.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-3 border-b border-cyan-500/30 bg-gradient-to-r from-[#0d1627] via-[#130f24] to-[#0d1627] px-4 py-2.5 shadow-lg",children:[
  e.jsxs("div",{className:"flex items-center gap-3",children:[
    e.jsxs("div",{className:"flex items-center gap-2 cursor-pointer select-none",onClick:()=>{if(d){const u=d.tts?.enabled;V(d.id,{tts:{enabled:!u,voiceId:d.tts?.voiceId||"aN7cv9yXNrfIR87bDmyD",voiceName:d.tts?.voiceName||"Ninh Đôn – Deep & Warm",script:d.tts?.script||"",modelId:d.tts?.modelId||"eleven_multilingual_v2"}});}}},children:[
      e.jsx("span",{className:"text-base animate-pulse",children:"🎙️"}),
      e.jsxs("div",{children:[
        e.jsx("span",{className:"text-xs font-bold text-cyan-300 uppercase tracking-wider block",children:"Lồng Tiếng ElevenLabs"}),
        e.jsx("span",{className:"text-[10px] text-text-muted block",children:d?\`Phân cảnh #\${d.index}: \${d.tts?.enabled?("Đang bật: "+(d.tts?.voiceName||"Ninh Đôn – Deep & Warm")):"Chưa bật"}\`:"Tự động tạo giọng đọc và ghép trực tiếp vào video"})
      ]})
    ]}),
    e.jsxs("button",{type:"button",onClick:()=>{if(d){const u=d.tts?.enabled;V(d.id,{tts:{enabled:!u,voiceId:d.tts?.voiceId||"aN7cv9yXNrfIR87bDmyD",voiceName:d.tts?.voiceName||"Ninh Đôn – Deep & Warm",script:d.tts?.script||"",modelId:d.tts?.modelId||"eleven_multilingual_v2"}});}},className:\`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer shadow-sm \${d?.tts?.enabled?"bg-cyan-500 text-black border-cyan-400 font-extrabold shadow-cyan-500/30":"bg-white/10 text-white/70 border-white/20 hover:border-cyan-400 hover:text-white"}\`,children:[
      e.jsx("span",{className:\`w-2 h-2 rounded-full \${d?.tts?.enabled?"bg-black":"bg-text-muted"}\`}),
      d?.tts?.enabled?"ĐANG BẬT":"TẮT"
    ]}),
    e.jsx("button",{type:"button",title:"Áp dụng giọng đọc hiện tại và bật lồng tiếng cho TẤT CẢ các phân cảnh",onClick:()=>{
      const curVid=d?.tts?.voiceId||"aN7cv9yXNrfIR87bDmyD";
      const curVname=d?.tts?.voiceName||"Ninh Đôn – Deep & Warm";
      const curMid=d?.tts?.modelId||"eleven_multilingual_v2";
      G.forEach(rw=>{
        V(rw.id,{tts:{enabled:!0,voiceId:curVid,voiceName:curVname,script:rw.tts?.script||"",modelId:curMid}});
      });
      if(typeof window!=="undefined"&&window.localStorage){
        try{
          const raw=window.localStorage.getItem("aiforge.ttsStudio.savedVoices.v1");
          const sv=raw?JSON.parse(raw):[];
          const updated=[{voiceId:curVid,voiceName:curVname,source:"shared",savedAt:new Date().toISOString()},...sv.filter(x=>x&&x.voiceId!==curVid)];
          window.localStorage.setItem("aiforge.ttsStudio.savedVoices.v1",JSON.stringify(updated));
        }catch(_){}
      }
    },className:"text-[11px] font-bold text-cyan-400 hover:text-cyan-300 underline underline-offset-2 ml-1 cursor-pointer bg-cyan-950/40 border border-cyan-500/30 px-2 py-0.5 rounded",children:"Áp dụng tất cả phân cảnh"})
  ]}),
  d?.tts?.enabled?e.jsxs("div",{className:"flex flex-1 min-w-[320px] max-w-[780px] items-center gap-2 justify-end",children:[
    e.jsxs("select",{value:d.tts?.voiceId||"aN7cv9yXNrfIR87bDmyD",onChange:p=>{
      const v=p.target.value,w=p.target.options[p.target.selectedIndex].text;
      V(d.id,{tts:{...(d.tts||{}),voiceId:v,voiceName:w}});
    },className:"h-7 rounded-lg border border-cyan-500/40 bg-[#130f24] px-2 text-[11px] font-medium text-cyan-200 outline-none focus:border-cyan-400 shrink-0 max-w-[200px] truncate",children:[
      e.jsx("option",{value:"aN7cv9yXNrfIR87bDmyD",children:"Ninh Đôn (Tiếng Việt - Trầm ấm)"}),
      e.jsx("option",{value:"EcENCamMHdzIoMysqdsv",children:"Ethan (Tiếng Việt - Rõ ràng)"}),
      e.jsx("option",{value:"ipTvfDXAg1zowfF1rv9w",children:"Hoàng Đặng (Tiếng Việt - Trầm vang)"}),
      e.jsx("option",{value:"KVzG2JMdZJKi6y7cwERP",children:"Quang Nguyen (Tiếng Việt - Tự nhiên)"}),
      e.jsx("option",{value:"21m00Tcm4TlvDq8ikWAM",children:"Rachel (Nữ - Truyền cảm)"}),
      e.jsx("option",{value:"pNInz6obpgDQGcFmaJgB",children:"Adam (Nam - Trầm ấm)"}),
      e.jsx("option",{value:"ErXwobaYiN019PkySvjV",children:"Antoni (Nam - Sinh động)"}),
      e.jsx("option",{value:"EXAVITQu4vr4xnSDxMaL",children:"Bella (Nữ - Ngọt ngào)"}),
      e.jsx("option",{value:"VR6AewLTigWG4xSOukaG",children:"Arnold (Nam - Mạnh mẽ)"}),
      e.jsx("option",{value:"AZnzlk1XvdvUeBnXmlld",children:"Domi (Nữ - Lôi cuốn)"}),
      e.jsx("option",{value:"MF3mGyEYCl7XYWbV9V6O",children:"Elli (Nữ - Cảm xúc)"}),
      e.jsx("option",{value:"TxGEqnHWrfWFTfGW9XjX",children:"Josh (Nam - Tự tin)"})
    ]}),
    e.jsxs("div",{className:"relative flex items-center shrink-0",children:[
      e.jsx("input",{type:"text",value:d.tts?.voiceId||"",onBlur:async p=>{
        let v=(p.target.value||"").trim().replace(/^.*voices\\//i,"").replace(/^.*share\\//i,"").replace(/\\?.*$/,"").trim();
        if(!v)return;
        if(window.aiforge?.tts?.lookupSharedVoice){
          try{
            const res=await window.aiforge.tts.lookupSharedVoice(v);
            if(res&&(res.voiceName||res.name)){
              const vName=res.voiceName||res.name;
              V(d.id,{tts:{...(d.tts||{}),voiceId:v,voiceName:vName}});
              const raw=window.localStorage.getItem("aiforge.ttsStudio.savedVoices.v1");
              const sv=raw?JSON.parse(raw):[];
              const updated=[{voiceId:v,voiceName:vName,source:"shared",savedAt:new Date().toISOString()},...sv.filter(x=>x&&x.voiceId!==v)];
              window.localStorage.setItem("aiforge.ttsStudio.savedVoices.v1",JSON.stringify(updated));
            }
          }catch(_){}
        }
      },onKeyDown:async p=>{
        if(p.key==="Enter"){
          p.preventDefault();
          let v=(p.currentTarget.value||"").trim().replace(/^.*voices\\//i,"").replace(/^.*share\\//i,"").replace(/\\?.*$/,"").trim();
          if(!v)return;
          if(window.aiforge?.tts?.lookupSharedVoice){
            try{
              const res=await window.aiforge.tts.lookupSharedVoice(v);
              if(res&&(res.voiceName||res.name)){
                const vName=res.voiceName||res.name;
                V(d.id,{tts:{...(d.tts||{}),voiceId:v,voiceName:vName}});
                const raw=window.localStorage.getItem("aiforge.ttsStudio.savedVoices.v1");
                const sv=raw?JSON.parse(raw):[];
                const updated=[{voiceId:v,voiceName:vName,source:"shared",savedAt:new Date().toISOString()},...sv.filter(x=>x&&x.voiceId!==v)];
                window.localStorage.setItem("aiforge.ttsStudio.savedVoices.v1",JSON.stringify(updated));
              }
            }catch(_){}
          }
        }
      },onChange:p=>{
        const v=p.target.value.trim().replace(/^.*voices\\//i,"").replace(/^.*share\\//i,"").replace(/\\?.*$/,"");
        V(d.id,{tts:{...(d.tts||{}),voiceId:v,voiceName:v?\`Custom (\${v.slice(0,6)}...)\`:""}});
      },placeholder:"Dán Voice ID...",className:"w-28 h-7 rounded-lg border border-white/15 bg-[#130f24] pl-2 pr-7 text-[10px] text-text-primary outline-none focus:border-cyan-400 shrink-0"}),
      e.jsx("button",{type:"button",title:"Nhận diện mã giọng đọc và lưu vào bộ nhớ",onClick:async()=>{
        let v=(d.tts?.voiceId||"").trim().replace(/^.*voices\\//i,"").replace(/^.*share\\//i,"").replace(/\\?.*$/,"").trim();
        if(!v)return;
        if(window.aiforge?.tts?.lookupSharedVoice){
          try{
            const res=await window.aiforge.tts.lookupSharedVoice(v);
            if(res&&(res.voiceName||res.name)){
              const vName=res.voiceName||res.name;
              V(d.id,{tts:{...(d.tts||{}),voiceId:v,voiceName:vName}});
              const raw=window.localStorage.getItem("aiforge.ttsStudio.savedVoices.v1");
              const sv=raw?JSON.parse(raw):[];
              const updated=[{voiceId:v,voiceName:vName,source:"shared",savedAt:new Date().toISOString()},...sv.filter(x=>x&&x.voiceId!==v)];
              window.localStorage.setItem("aiforge.ttsStudio.savedVoices.v1",JSON.stringify(updated));
            }
          }catch(_){}
        }
      },className:"absolute right-1 top-1 bottom-1 px-1 text-[9px] font-bold text-cyan-400 hover:text-cyan-200 cursor-pointer",children:"🔍"})
    ]}),
    e.jsx("input",{type:"text",value:d.tts?.script||"",onChange:p=>V(d.id,{tts:{...(d.tts||{}),script:p.target.value}}),placeholder:\`Nhập lời thoại nhân vật cho Phân cảnh #\${d.index}...\`,className:"flex-1 h-7 rounded-lg border border-cyan-500/50 bg-[#130f24] px-2.5 text-xs text-white placeholder:text-text-muted/60 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40"})
  ]}):e.jsx("div",{className:"text-[11px] text-text-muted italic",children:"Bấm nút [TẮT / ĐANG BẬT] ở trên để lồng tiếng ElevenLabs cho phân cảnh này"})
]}),`;

// Clean inspector section
const newInspectorSection = `e.jsxs("section",{className:"flex flex-col gap-2.5 rounded-lg border border-cyan-500/25 bg-cyan-950/20 p-3 shadow-[0_0_15px_rgba(6,182,212,0.06)]",children:[
  e.jsxs("div",{className:"flex items-center justify-between",children:[
    e.jsxs("label",{className:"text-[10px] font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5 cursor-pointer",onClick:()=>{const u=n.tts?.enabled;R(n.id,{tts:{enabled:!u,voiceId:n.tts?.voiceId||"aN7cv9yXNrfIR87bDmyD",voiceName:n.tts?.voiceName||"Ninh Đôn – Deep & Warm",script:n.tts?.script||"",modelId:n.tts?.modelId||"eleven_multilingual_v2"}});}},children:["🎙️ ElevenLabs Voice (Lồng tiếng)"]}),
    e.jsx("button",{type:"button",onClick:()=>{const u=n.tts?.enabled;R(n.id,{tts:{enabled:!u,voiceId:n.tts?.voiceId||"aN7cv9yXNrfIR87bDmyD",voiceName:n.tts?.voiceName||"Ninh Đôn – Deep & Warm",script:n.tts?.script||"",modelId:n.tts?.modelId||"eleven_multilingual_v2"}});},className:\`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none \${n.tts?.enabled?"bg-cyan-500":"bg-white/10"}\`,children:e.jsx("span",{className:\`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out \${n.tts?.enabled?"translate-x-4":"translate-x-0"}\`})})
  ]}),
  n.tts?.enabled&&e.jsxs("div",{className:"flex flex-col gap-2.5 pt-1 border-t border-cyan-500/15",children:[
    e.jsxs("div",{className:"flex flex-col gap-1",children:[
      e.jsx("label",{className:"text-[9px] font-semibold text-text-muted uppercase tracking-wider",children:"Chọn Giọng Đọc (Voice Preset)"}),
      e.jsxs("select",{value:n.tts?.voiceId||"aN7cv9yXNrfIR87bDmyD",onChange:p=>{
        const v=p.target.value,w=p.target.options[p.target.selectedIndex].text;
        R(n.id,{tts:{...(n.tts||{}),voiceId:v,voiceName:w}});
      },className:"w-full h-8 rounded-lg border border-white/10 bg-[#130f2480] px-2 text-xs text-text-primary outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40",children:[
        e.jsx("option",{value:"aN7cv9yXNrfIR87bDmyD",children:"Ninh Đôn (Tiếng Việt - Trầm ấm, truyền cảm)"}),
        e.jsx("option",{value:"EcENCamMHdzIoMysqdsv",children:"Ethan (Tiếng Việt - Rõ ràng, dứt khoát)"}),
        e.jsx("option",{value:"ipTvfDXAg1zowfF1rv9w",children:"Hoàng Đặng (Tiếng Việt - Trầm vang, cuốn hút)"}),
        e.jsx("option",{value:"KVzG2JMdZJKi6y7cwERP",children:"Quang Nguyen (Tiếng Việt - Tự nhiên, sinh động)"}),
        e.jsx("option",{value:"21m00Tcm4TlvDq8ikWAM",children:"Rachel (Nữ - Truyền cảm)"}),
        e.jsx("option",{value:"pNInz6obpgDQGcFmaJgB",children:"Adam (Nam - Trầm ấm, chuyên nghiệp)"}),
        e.jsx("option",{value:"ErXwobaYiN019PkySvjV",children:"Antoni (Nam - Tự nhiên, sinh động)"}),
        e.jsx("option",{value:"EXAVITQu4vr4xnSDxMaL",children:"Bella (Nữ - Trẻ trung, ngọt ngào)"}),
        e.jsx("option",{value:"VR6AewLTigWG4xSOukaG",children:"Arnold (Nam - Mạnh mẽ, dứt khoát)"}),
        e.jsx("option",{value:"AZnzlk1XvdvUeBnXmlld",children:"Domi (Nữ - Rõ ràng, lôi cuốn)"}),
        e.jsx("option",{value:"MF3mGyEYCl7XYWbV9V6O",children:"Elli (Nữ - Cảm xúc, tự nhiên)"}),
        e.jsx("option",{value:"TxGEqnHWrfWFTfGW9XjX",children:"Josh (Nam - Trẻ trung, tự tin)"})
      ]})
    ]}),
    e.jsxs("div",{className:"flex flex-col gap-1",children:[
      e.jsxs("div",{className:"flex items-center justify-between",children:[
        e.jsx("label",{className:"text-[9px] font-semibold text-text-muted uppercase tracking-wider",children:"Mã Voice ID / Link ElevenLabs"}),
        n.tts?.voiceName&&e.jsx("span",{className:"text-[9px] font-bold text-cyan-400 truncate max-w-[160px]",children:\`✓ \${n.tts.voiceName}\`})
      ]}),
      e.jsxs("div",{className:"relative flex items-center",children:[
        e.jsx("input",{type:"text",value:n.tts?.voiceId||"",onBlur:async p=>{
          let v=(p.target.value||"").trim().replace(/^.*voices\\//i,"").replace(/^.*share\\//i,"").replace(/\\?.*$/,"").trim();
          if(!v)return;
          if(window.aiforge?.tts?.lookupSharedVoice){
            try{
              const res=await window.aiforge.tts.lookupSharedVoice(v);
              if(res&&(res.voiceName||res.name)){
                const vName=res.voiceName||res.name;
                R(n.id,{tts:{...(n.tts||{}),voiceId:v,voiceName:vName}});
                const raw=window.localStorage.getItem("aiforge.ttsStudio.savedVoices.v1");
                const sv=raw?JSON.parse(raw):[];
                const updated=[{voiceId:v,voiceName:vName,source:"shared",savedAt:new Date().toISOString()},...sv.filter(x=>x&&x.voiceId!==v)];
                window.localStorage.setItem("aiforge.ttsStudio.savedVoices.v1",JSON.stringify(updated));
              }
            }catch(_){}
          }
        },onKeyDown:async p=>{
          if(p.key==="Enter"){
            p.preventDefault();
            let v=(p.currentTarget.value||"").trim().replace(/^.*voices\\//i,"").replace(/^.*share\\//i,"").replace(/\\?.*$/,"").trim();
            if(!v)return;
            if(window.aiforge?.tts?.lookupSharedVoice){
              try{
                const res=await window.aiforge.tts.lookupSharedVoice(v);
                if(res&&(res.voiceName||res.name)){
                  const vName=res.voiceName||res.name;
                  R(n.id,{tts:{...(n.tts||{}),voiceId:v,voiceName:vName}});
                  const raw=window.localStorage.getItem("aiforge.ttsStudio.savedVoices.v1");
                  const sv=raw?JSON.parse(raw):[];
                  const updated=[{voiceId:v,voiceName:vName,source:"shared",savedAt:new Date().toISOString()},...sv.filter(x=>x&&x.voiceId!==v)];
                  window.localStorage.setItem("aiforge.ttsStudio.savedVoices.v1",JSON.stringify(updated));
                }
              }catch(_){}
            }
          }
        },onChange:p=>{
          const v=p.target.value.trim().replace(/^.*voices\\//i,"").replace(/^.*share\\//i,"").replace(/\\?.*$/,"");
          R(n.id,{tts:{...(n.tts||{}),voiceId:v,voiceName:v?\`Custom (\${v.slice(0,6)}...)\`:""}});
        },placeholder:"Nhập hoặc dán mã Voice ID...",className:"w-full h-7 rounded-lg border border-white/10 bg-[#130f2480] pl-2 pr-16 text-[11px] text-text-primary outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40"}),
        e.jsx("button",{type:"button",onClick:async()=>{
          let v=(n.tts?.voiceId||"").trim().replace(/^.*voices\\//i,"").replace(/^.*share\\//i,"").replace(/\\?.*$/,"").trim();
          if(!v)return;
          if(window.aiforge?.tts?.lookupSharedVoice){
            try{
              const res=await window.aiforge.tts.lookupSharedVoice(v);
              if(res&&(res.voiceName||res.name)){
                const vName=res.voiceName||res.name;
                R(n.id,{tts:{...(n.tts||{}),voiceId:v,voiceName:vName}});
                const raw=window.localStorage.getItem("aiforge.ttsStudio.savedVoices.v1");
                const sv=raw?JSON.parse(raw):[];
                const updated=[{voiceId:v,voiceName:vName,source:"shared",savedAt:new Date().toISOString()},...sv.filter(x=>x&&x.voiceId!==v)];
                window.localStorage.setItem("aiforge.ttsStudio.savedVoices.v1",JSON.stringify(updated));
              }
            }catch(_){}
          }
        },className:"absolute right-1 top-1 bottom-1 px-2 rounded bg-cyan-950/60 border border-cyan-500/40 text-[10px] font-bold text-cyan-300 hover:text-white cursor-pointer",children:"Nhận diện"})
      ]})
    ]}),
    e.jsxs("div",{className:"flex flex-col gap-1",children:[
      e.jsxs("div",{className:"flex items-center justify-between",children:[
        e.jsx("label",{className:"text-[9px] font-semibold text-text-muted uppercase tracking-wider",children:"Lời thoại nhân vật (Dialogue Script)"}),
        e.jsx("span",{className:"text-[8px] text-cyan-400 font-medium",children:"Đồng bộ giọng đọc với video"})
      ]}),
      e.jsx("textarea",{value:n.tts?.script||"",onChange:p=>R(n.id,{tts:{...(n.tts||{}),script:p.target.value}}),placeholder:"Nhập câu thoại của nhân vật trong phân cảnh này...",rows:3,className:"w-full resize-y rounded-lg border border-white/10 bg-[#130f2480] p-2 text-xs leading-4 text-text-primary outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 placeholder:text-text-muted/60"})
    ]}),
    e.jsxs("div",{className:"flex items-center justify-between gap-2",children:[
      e.jsx("span",{className:"text-[9px] font-semibold text-text-muted uppercase tracking-wider",children:"Model TTS:"}),
      e.jsxs("select",{value:n.tts?.modelId||"eleven_multilingual_v2",onChange:p=>R(n.id,{tts:{...(n.tts||{}),modelId:p.target.value}}),className:"h-6 rounded border border-white/10 bg-[#130f2480] px-1.5 text-[10px] text-text-primary outline-none",children:[
        e.jsx("option",{value:"eleven_multilingual_v2",children:"Multilingual v2 (Chuẩn tiếng Việt & Đa ngôn ngữ)"}),
        e.jsx("option",{value:"eleven_flash_v2_5",children:"Flash v2.5 (Siêu tốc)"}),
        e.jsx("option",{value:"eleven_turbo_v2_5",children:"Turbo v2.5 (Cân bằng)"})
      ]})
    ]})
  ]})
]}),`;

for (const root of targetRoots) {
  const vsPath = path.join(root, 'out/renderer/assets/VideoStudio-BZY_1pM8.js');
  if (!fs.existsSync(vsPath)) continue;
  console.log('[*] Đang sửa lỗi cú pháp tại:', vsPath);
  let code = fs.readFileSync(vsPath, 'utf8');

  // Replace Top Toolbar Banner
  const headerAnchor = 'e.jsx("span",{children:sr($,"video")})]})]}),';
  const startIdx = code.indexOf(headerAnchor);
  if (startIdx !== -1) {
    const afterAnchor = code.slice(startIdx + headerAnchor.length);
    if (afterAnchor.startsWith('e.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-3 border-b border-cyan-500/30')) {
      const bannerEndIdx = afterAnchor.indexOf(']}),') + 4;
      code = code.slice(0, startIdx + headerAnchor.length) + topToolbarBanner + afterAnchor.slice(bannerEndIdx);
    }
  }

  // Replace Inspector Section
  const inspectorSectionRegex = /e\.jsxs\("section",\{className:"flex flex-col gap-2\.5 rounded-lg border border-cyan-500\/25[\s\S]*?\]\}\),\]\}\),/g;
  if (inspectorSectionRegex.test(code)) {
    code = code.replace(inspectorSectionRegex, newInspectorSection);
  }

  fs.writeFileSync(vsPath, code, 'utf8');

  // Verify syntax with node --check
  fs.writeFileSync('temp_check.mjs', code);
  try {
    execSync('node --check temp_check.mjs', { stdio: 'inherit' });
    console.log('  ✓ [PASS] Cú pháp VideoStudio hoàn toàn CHÍNH XÁC 100%!');
  } catch (err) {
    console.error('  ❌ Vẫn còn lỗi cú pháp trong:', vsPath);
    process.exit(1);
  } finally {
    try { fs.unlinkSync('temp_check.mjs'); } catch (_) {}
  }
}

console.log('\n🎉 ĐÃ KHẮC PHỤC TRIỆT ĐỂ LỖI CÚ PHÁP TRONG VIDEO STUDIO! 🎉');
