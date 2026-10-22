const fs = require('fs');
const vm = require('vm');
const path = require('path');

const pristinePath = path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Khach_Hang_v3.0/resources/app/out/renderer/assets/VideoStudio-BZY_1pM8.js');
let origCode = fs.readFileSync(pristinePath, 'utf8');

// 1. Top Toolbar Banner using NO backticks / NO template literal hazards
const topToolbarBanner = 'e.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-3 border-b border-emerald-500/30 bg-gradient-to-r from-[#0d1f1a] via-[#101726] to-[#0d1f1a] px-4 py-2.5 shadow-lg",children:[' +
  'e.jsxs("div",{className:"flex items-center gap-3",children:[' +
    'e.jsxs("div",{className:"flex items-center gap-2 cursor-pointer select-none",onClick:()=>{if(d){const u=d.tts?.enabled;V(d.id,{tts:{enabled:!u,voiceId:d.tts?.voiceId||"aN7cv9yXNrfIR87bDmyD",voiceName:d.tts?.voiceName||"Ninh Đôn – Deep & Warm (Tiếng Việt)",script:d.tts?.script||"",modelId:d.tts?.modelId||"eleven_multilingual_v2"}});}},children:[' +
      'e.jsx("span",{className:"text-base animate-pulse",children:"🎙️"}),' +
      'e.jsxs("div",{children:[' +
        'e.jsx("span",{className:"text-xs font-bold text-emerald-300 uppercase tracking-wider block",children:"Lồng Tiếng ElevenLabs (Auto-Dubbing)"}),' +
        'e.jsx("span",{className:"text-[10px] text-text-muted block",children:d?("Phân cảnh #" + d.index + ": " + (d.tts?.enabled?("Đang bật: "+(d.tts?.voiceName||"Ninh Đôn – Deep & Warm (Tiếng Việt)")):"Tắt (Gạt để bật)")):"Tự động nhận diện kịch bản và ghép trực tiếp vào video"})' +
      ']})' +
    ']}),' +
    'e.jsxs("div",{className:"flex items-center gap-2 cursor-pointer select-none",onClick:()=>{if(d){const u=d.tts?.enabled;V(d.id,{tts:{enabled:!u,voiceId:d.tts?.voiceId||"aN7cv9yXNrfIR87bDmyD",voiceName:d.tts?.voiceName||"Ninh Đôn – Deep & Warm (Tiếng Việt)",script:d.tts?.script||"",modelId:d.tts?.modelId||"eleven_multilingual_v2"}});}},children:[' +
      'e.jsx("div",{className:"relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none shadow-sm " + (d?.tts?.enabled?"bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]":"bg-white/20 hover:bg-white/30"),children:e.jsx("span",{className:"pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out " + (d?.tts?.enabled?"translate-x-4":"translate-x-0")})}),' +
      'e.jsx("span",{className:"text-xs font-extrabold uppercase tracking-wider " + (d?.tts?.enabled?"text-emerald-400":"text-white/40"),children:d?.tts?.enabled?"ON":"OFF"})' +
    ']}),' +
    'e.jsx("button",{type:"button",title:"Áp dụng giọng đọc hiện tại và bật lồng tiếng cho TẤT CẢ các phân cảnh",onClick:()=>{' +
      'const curVid=d?.tts?.voiceId||"aN7cv9yXNrfIR87bDmyD";' +
      'const curVname=d?.tts?.voiceName||"Ninh Đôn – Deep & Warm (Tiếng Việt)";' +
      'const curMid=d?.tts?.modelId||"eleven_multilingual_v2";' +
      'G.forEach(rw=>{' +
        'V(rw.id,{tts:{enabled:!0,voiceId:curVid,voiceName:curVname,script:rw.tts?.script||"",modelId:curMid}});' +
      '});' +
      'if(typeof window!=="undefined"&&window.localStorage){' +
        'try{' +
          'const raw=window.localStorage.getItem("aiforge.ttsStudio.savedVoices.v1");' +
          'const sv=raw?JSON.parse(raw):[];' +
          'const updated=[{voiceId:curVid,voiceName:curVname,source:"shared",savedAt:new Date().toISOString()},...sv.filter(x=>x&&x.voiceId!==curVid)];' +
          'window.localStorage.setItem("aiforge.ttsStudio.savedVoices.v1",JSON.stringify(updated));' +
        '}catch(_){}' +
      '}' +
    '},className:"text-[11px] font-bold text-emerald-400 hover:text-emerald-300 underline underline-offset-2 ml-1 cursor-pointer bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded",children:"Áp dụng tất cả phân cảnh"})' +
  ']}),' +
  '(d?.tts?.enabled?e.jsxs("div",{className:"flex flex-1 min-w-[320px] max-w-[820px] items-center gap-2 justify-end",children:[' +
    'e.jsxs("select",{value:d.tts?.voiceId||"aN7cv9yXNrfIR87bDmyD",onChange:p=>{' +
      'const v=p.target.value,w=p.target.options[p.target.selectedIndex].text;' +
      'V(d.id,{tts:{...(d.tts||{}),voiceId:v,voiceName:w}});' +
    '},className:"h-7 rounded-lg border border-emerald-500/40 bg-[#101726] px-2 text-[11px] font-medium text-emerald-200 outline-none focus:border-emerald-400 shrink-0 max-w-[210px] truncate",children:[' +
      'e.jsx("option",{value:"aN7cv9yXNrfIR87bDmyD",children:"Ninh Đôn (Tiếng Việt - Nam Trầm ấm)"}),' +
      'e.jsx("option",{value:"EcENCamMHdzIoMysqdsv",children:"Ethan (Tiếng Việt - Nam Rõ ràng)"}),' +
      'e.jsx("option",{value:"ipTvfDXAg1zowfF1rv9w",children:"Hoàng Đặng (Tiếng Việt - Nam Trầm vang)"}),' +
      'e.jsx("option",{value:"KVzG2JMdZJKi6y7cwERP",children:"Quang Nguyễn (Tiếng Việt - Nam Tự nhiên)"}),' +
      'e.jsx("option",{value:"ThT5KcBeYPX3keUQqHPh",children:"Thu Hà (Tiếng Việt - Nữ Truyền cảm)"}),' +
      'e.jsx("option",{value:"g5CIjZEefAph4nQFvHAz",children:"Mai Linh (Tiếng Việt - Nữ Dịu dàng)"}),' +
      'e.jsx("option",{value:"21m00Tcm4TlvDq8ikWAM",children:"Rachel (Nữ - Truyền cảm)"}),' +
      'e.jsx("option",{value:"pNInz6obpgDQGcFmaJgB",children:"Adam (Nam - Trầm ấm)"}),' +
      'e.jsx("option",{value:"ErXwobaYiN019PkySvjV",children:"Antoni (Nam - Sinh động)"}),' +
      'e.jsx("option",{value:"EXAVITQu4vr4xnSDxMaL",children:"Bella (Nữ - Ngọt ngào)"}),' +
      'e.jsx("option",{value:"VR6AewLTigWG4xSOukaG",children:"Arnold (Nam - Mạnh mẽ)"}),' +
      'e.jsx("option",{value:"AZnzlk1XvdvUeBnXmlld",children:"Domi (Nữ - Lôi cuốn)"}),' +
      'e.jsx("option",{value:"MF3mGyEYCl7XYWbV9V6O",children:"Elli (Nữ - Cảm xúc)"}),' +
      'e.jsx("option",{value:"TxGEqnHWrfWFTfGW9XjX",children:"Josh (Nam - Tự tin)"}),' +
      '...(typeof window!=="undefined"&&window.localStorage?(()=>{' +
        'try{' +
          'const raw=window.localStorage.getItem("aiforge.ttsStudio.savedVoices.v1");' +
          'const sv=raw?JSON.parse(raw):[];' +
          'const defIds=new Set(["aN7cv9yXNrfIR87bDmyD","EcENCamMHdzIoMysqdsv","ipTvfDXAg1zowfF1rv9w","KVzG2JMdZJKi6y7cwERP","ThT5KcBeYPX3keUQqHPh","g5CIjZEefAph4nQFvHAz","21m00Tcm4TlvDq8ikWAM","pNInz6obpgDQGcFmaJgB","ErXwobaYiN019PkySvjV","EXAVITQu4vr4xnSDxMaL","VR6AewLTigWG4xSOukaG","AZnzlk1XvdvUeBnXmlld","MF3mGyEYCl7XYWbV9V6O","TxGEqnHWrfWFTfGW9XjX"]);' +
          'return sv.filter(x=>x&&x.voiceId&&!defIds.has(x.voiceId)).map(x=>e.jsx("option",{value:x.voiceId,children:"★ " + (x.voiceName||x.voiceId)},x.voiceId));' +
        '}catch(_){return[];}' +
      '})():[])' +
    ']}),' +
    'e.jsxs("div",{className:"relative flex items-center shrink-0",children:[' +
      'e.jsx("input",{type:"text",value:d.tts?.voiceId||"",onBlur:async p=>{' +
        'let v=(p.target.value||"").trim().replace(/^.*voices\\//i,"").replace(/^.*share\\//i,"").replace(/\\?.*$/,"").trim();' +
        'if(!v)return;' +
        'if(window.aiforge?.tts?.lookupSharedVoice){' +
          'try{' +
            'const res=await window.aiforge.tts.lookupSharedVoice(v);' +
            'if(res && (res.voiceName||res.name)){' +
              'const vName=res.voiceName||res.name;' +
              'V(d.id,{tts:{...(d.tts||{}),voiceId:v,voiceName:vName}});' +
              'const raw=window.localStorage.getItem("aiforge.ttsStudio.savedVoices.v1");' +
              'const sv=raw?JSON.parse(raw):[];' +
              'const updated=[{voiceId:v,voiceName:vName,source:"shared",savedAt:new Date().toISOString()},...sv.filter(x=>x&&x.voiceId!==v)];' +
              'window.localStorage.setItem("aiforge.ttsStudio.savedVoices.v1",JSON.stringify(updated));' +
            '}' +
          '}catch(_){}' +
        '}' +
      '},onKeyDown:async p=>{' +
        'if(p.key==="Enter"){' +
          'p.preventDefault();' +
          'let v=(p.currentTarget.value||"").trim().replace(/^.*voices\\//i,"").replace(/^.*share\\//i,"").replace(/\\?.*$/,"").trim();' +
          'if(!v)return;' +
          'if(window.aiforge?.tts?.lookupSharedVoice){' +
            'try{' +
              'const res=await window.aiforge.tts.lookupSharedVoice(v);' +
              'if(res && (res.voiceName||res.name)){' +
                'const vName=res.voiceName||res.name;' +
                'V(d.id,{tts:{...(d.tts||{}),voiceId:v,voiceName:vName}});' +
                'const raw=window.localStorage.getItem("aiforge.ttsStudio.savedVoices.v1");' +
                'const sv=raw?JSON.parse(raw):[];' +
                'const updated=[{voiceId:v,voiceName:vName,source:"shared",savedAt:new Date().toISOString()},...sv.filter(x=>x&&x.voiceId!==v)];' +
                'window.localStorage.setItem("aiforge.ttsStudio.savedVoices.v1",JSON.stringify(updated));' +
              '}' +
            '}catch(_){}' +
          '}' +
        '}' +
      '},onChange:p=>{' +
        'const v=p.target.value.trim().replace(/^.*voices\\//i,"").replace(/^.*share\\//i,"").replace(/\\?.*$/,"");' +
        'V(d.id,{tts:{...(d.tts||{}),voiceId:v,voiceName:v?("Custom (" + v.slice(0,6) + "...)"):""}});' +
      '},placeholder:"Dán Voice ID...",className:"w-28 h-7 rounded-lg border border-white/15 bg-[#101726] pl-2 pr-7 text-[10px] text-text-primary outline-none focus:border-emerald-400 shrink-0"}),' +
      'e.jsx("button",{type:"button",title:"Nhận diện mã giọng đọc và lưu vào bộ nhớ",onClick:async()=>{' +
        'let v=(d.tts?.voiceId||"").trim().replace(/^.*voices\\//i,"").replace(/^.*share\\//i,"").replace(/\\?.*$/,"").trim();' +
        'if(!v)return;' +
        'if(window.aiforge?.tts?.lookupSharedVoice){' +
          'try{' +
            'const res=await window.aiforge.tts.lookupSharedVoice(v);' +
            'if(res && (res.voiceName||res.name)){' +
              'const vName=res.voiceName||res.name;' +
              'V(d.id,{tts:{...(d.tts||{}),voiceId:v,voiceName:vName}});' +
              'const raw=window.localStorage.getItem("aiforge.ttsStudio.savedVoices.v1");' +
              'const sv=raw?JSON.parse(raw):[];' +
              'const updated=[{voiceId:v,voiceName:vName,source:"shared",savedAt:new Date().toISOString()},...sv.filter(x=>x&&x.voiceId!==v)];' +
              'window.localStorage.setItem("aiforge.ttsStudio.savedVoices.v1",JSON.stringify(updated));' +
            '}' +
          '}catch(_){}' +
        '}' +
      '},className:"absolute right-1 top-1 bottom-1 px-1 text-[9px] font-bold text-emerald-400 hover:text-emerald-200 cursor-pointer",children:"🔍"})' +
    ']}),' +
    'e.jsx("input",{type:"text",value:d.tts?.script||"",onChange:p=>V(d.id,{tts:{...(d.tts||{}),script:p.target.value}}),placeholder:"Để trống để TỰ ĐỘNG nhận diện kịch bản video #" + d.index + " (hoặc nhập thoại tùy chỉnh)...",className:"flex-1 h-7 rounded-lg border border-emerald-500/50 bg-[#101726] px-2.5 text-xs text-white placeholder:text-text-muted/60 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/40"})' +
  ']}):e.jsx("div",{className:"text-[11px] text-text-muted italic",children:"Gạt nút [ON] màu xanh ở trên để bật lồng tiếng ElevenLabs cho phân cảnh này"}))' +
']})';

// 2. Inspector Section using NO backticks
const newInspectorSection = 'e.jsxs("section",{className:"flex flex-col gap-2.5 rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-3 shadow-[0_0_15px_rgba(16,185,129,0.06)]",children:[' +
  'e.jsxs("div",{className:"flex items-center justify-between",children:[' +
    'e.jsxs("label",{className:"text-[10px] font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5 cursor-pointer",onClick:()=>{const u=n.tts?.enabled;R(n.id,{tts:{enabled:!u,voiceId:n.tts?.voiceId||"aN7cv9yXNrfIR87bDmyD",voiceName:n.tts?.voiceName||"Ninh Đôn – Deep & Warm (Tiếng Việt)",script:n.tts?.script||"",modelId:n.tts?.modelId||"eleven_multilingual_v2"}});}},children:["🎙️ Lồng Tiếng ElevenLabs"]}),' +
    'e.jsxs("div",{className:"flex items-center gap-1.5 cursor-pointer select-none",onClick:()=>{const u=n.tts?.enabled;R(n.id,{tts:{enabled:!u,voiceId:n.tts?.voiceId||"aN7cv9yXNrfIR87bDmyD",voiceName:n.tts?.voiceName||"Ninh Đôn – Deep & Warm (Tiếng Việt)",script:n.tts?.script||"",modelId:n.tts?.modelId||"eleven_multilingual_v2"}});}},children:[' +
      'e.jsx("div",{className:"relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out shadow-sm " + (n.tts?.enabled?"bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]":"bg-white/20 hover:bg-white/30"),children:e.jsx("span",{className:"pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out " + (n.tts?.enabled?"translate-x-4":"translate-x-0")})}),' +
      'e.jsx("span",{className:"text-[10px] font-extrabold uppercase tracking-wider " + (n.tts?.enabled?"text-emerald-400":"text-white/40"),children:n.tts?.enabled?"ON":"OFF"})' +
    ']})' +
  ']}),' +
  '(n.tts?.enabled&&e.jsxs("div",{className:"flex flex-col gap-2.5 pt-1 border-t border-emerald-500/20",children:[' +
    'e.jsxs("div",{className:"flex flex-col gap-1",children:[' +
      'e.jsx("label",{className:"text-[9px] font-semibold text-text-muted uppercase tracking-wider",children:"Chọn Giọng Đọc (Voice Preset)"}),' +
      'e.jsxs("select",{value:n.tts?.voiceId||"aN7cv9yXNrfIR87bDmyD",onChange:p=>{' +
        'const v=p.target.value,w=p.target.options[p.target.selectedIndex].text;' +
        'R(n.id,{tts:{...(n.tts||{}),voiceId:v,voiceName:w}});' +
      '},className:"w-full h-8 rounded-lg border border-white/10 bg-[#101726] px-2 text-xs text-text-primary outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/40",children:[' +
        'e.jsx("option",{value:"aN7cv9yXNrfIR87bDmyD",children:"Ninh Đôn (Tiếng Việt - Nam Trầm ấm, truyền cảm)"}),' +
        'e.jsx("option",{value:"EcENCamMHdzIoMysqdsv",children:"Ethan (Tiếng Việt - Nam Rõ ràng, dứt khoát)"}),' +
        'e.jsx("option",{value:"ipTvfDXAg1zowfF1rv9w",children:"Hoàng Đặng (Tiếng Việt - Nam Trầm vang, thuyết minh)"}),' +
        'e.jsx("option",{value:"KVzG2JMdZJKi6y7cwERP",children:"Quang Nguyễn (Tiếng Việt - Nam Tự nhiên, sôi nổi)"}),' +
        'e.jsx("option",{value:"ThT5KcBeYPX3keUQqHPh",children:"Thu Hà (Tiếng Việt - Nữ Truyền cảm, mềm mại)"}),' +
        'e.jsx("option",{value:"g5CIjZEefAph4nQFvHAz",children:"Mai Linh (Tiếng Việt - Nữ Dịu dàng, cảm xúc)"}),' +
        'e.jsx("option",{value:"21m00Tcm4TlvDq8ikWAM",children:"Rachel (Nữ - Truyền cảm)"}),' +
        'e.jsx("option",{value:"pNInz6obpgDQGcFmaJgB",children:"Adam (Nam - Trầm ấm, chuyên nghiệp)"}),' +
        'e.jsx("option",{value:"ErXwobaYiN019PkySvjV",children:"Antoni (Nam - Tự nhiên, sinh động)"}),' +
        'e.jsx("option",{value:"EXAVITQu4vr4xnSDxMaL",children:"Bella (Nữ - Trẻ trung, ngọt ngào)"}),' +
        'e.jsx("option",{value:"VR6AewLTigWG4xSOukaG",children:"Arnold (Nam - Mạnh mẽ, dứt khoát)"}),' +
        'e.jsx("option",{value:"AZnzlk1XvdvUeBnXmlld",children:"Domi (Nữ - Rõ ràng, lôi cuốn)"}),' +
        'e.jsx("option",{value:"MF3mGyEYCl7XYWbV9V6O",children:"Elli (Nữ - Cảm xúc, tự nhiên)"}),' +
        'e.jsx("option",{value:"TxGEqnHWrfWFTfGW9XjX",children:"Josh (Nam - Trẻ trung, tự tin)"}),' +
        '...(typeof window!=="undefined"&&window.localStorage?(()=>{' +
          'try{' +
            'const raw=window.localStorage.getItem("aiforge.ttsStudio.savedVoices.v1");' +
            'const sv=raw?JSON.parse(raw):[];' +
            'const defIds=new Set(["aN7cv9yXNrfIR87bDmyD","EcENCamMHdzIoMysqdsv","ipTvfDXAg1zowfF1rv9w","KVzG2JMdZJKi6y7cwERP","ThT5KcBeYPX3keUQqHPh","g5CIjZEefAph4nQFvHAz","21m00Tcm4TlvDq8ikWAM","pNInz6obpgDQGcFmaJgB","ErXwobaYiN019PkySvjV","EXAVITQu4vr4xnSDxMaL","VR6AewLTigWG4xSOukaG","AZnzlk1XvdvUeBnXmlld","MF3mGyEYCl7XYWbV9V6O","TxGEqnHWrfWFTfGW9XjX"]);' +
            'return sv.filter(x=>x&&x.voiceId&&!defIds.has(x.voiceId)).map(x=>e.jsx("option",{value:x.voiceId,children:"★ " + (x.voiceName||x.voiceId)},x.voiceId));' +
          '}catch(_){return[];}' +
        '})():[])' +
      ']})' +
    ']}),' +
    'e.jsxs("div",{className:"flex flex-col gap-1",children:[' +
      'e.jsxs("div",{className:"flex items-center justify-between",children:[' +
        'e.jsx("label",{className:"text-[9px] font-semibold text-text-muted uppercase tracking-wider",children:"Mã Voice ID / Link ElevenLabs"}),' +
        'n.tts?.voiceName&&e.jsx("span",{className:"text-[9px] font-bold text-emerald-400 truncate max-w-[160px]",children:"✓ " + n.tts.voiceName})' +
      ']}),' +
      'e.jsxs("div",{className:"relative flex items-center",children:[' +
        'e.jsx("input",{type:"text",value:n.tts?.voiceId||"",onBlur:async p=>{' +
          'let v=(p.target.value||"").trim().replace(/^.*voices\\//i,"").replace(/^.*share\\//i,"").replace(/\\?.*$/,"").trim();' +
          'if(!v)return;' +
          'if(window.aiforge?.tts?.lookupSharedVoice){' +
            'try{' +
              'const res=await window.aiforge.tts.lookupSharedVoice(v);' +
              'if(res && (res.voiceName||res.name)){' +
                'const vName=res.voiceName||res.name;' +
                'R(n.id,{tts:{...(n.tts||{}),voiceId:v,voiceName:vName}});' +
                'const raw=window.localStorage.getItem("aiforge.ttsStudio.savedVoices.v1");' +
                'const sv=raw?JSON.parse(raw):[];' +
                'const updated=[{voiceId:v,voiceName:vName,source:"shared",savedAt:new Date().toISOString()},...sv.filter(x=>x&&x.voiceId!==v)];' +
                'window.localStorage.setItem("aiforge.ttsStudio.savedVoices.v1",JSON.stringify(updated));' +
              '}' +
            '}catch(_){}' +
          '}' +
        '},onKeyDown:async p=>{' +
          'if(p.key==="Enter"){' +
            'p.preventDefault();' +
            'let v=(p.currentTarget.value||"").trim().replace(/^.*voices\\//i,"").replace(/^.*share\\//i,"").replace(/\\?.*$/,"").trim();' +
            'if(!v)return;' +
            'if(window.aiforge?.tts?.lookupSharedVoice){' +
              'try{' +
                'const res=await window.aiforge.tts.lookupSharedVoice(v);' +
                'if(res && (res.voiceName||res.name)){' +
                  'const vName=res.voiceName||res.name;' +
                  'R(n.id,{tts:{...(n.tts||{}),voiceId:v,voiceName:vName}});' +
                  'const raw=window.localStorage.getItem("aiforge.ttsStudio.savedVoices.v1");' +
                  'const sv=raw?JSON.parse(raw):[];' +
                  'const updated=[{voiceId:v,voiceName:vName,source:"shared",savedAt:new Date().toISOString()},...sv.filter(x=>x&&x.voiceId!==v)];' +
                  'window.localStorage.setItem("aiforge.ttsStudio.savedVoices.v1",JSON.stringify(updated));' +
                '}' +
              '}catch(_){}' +
            '}' +
          '}' +
        '},onChange:p=>{' +
          'const v=p.target.value.trim().replace(/^.*voices\\//i,"").replace(/^.*share\\//i,"").replace(/\\?.*$/,"");' +
          'R(n.id,{tts:{...(n.tts||{}),voiceId:v,voiceName:v?("Custom (" + v.slice(0,6) + "...)"):""}});' +
        '},placeholder:"Nhập hoặc dán mã Voice ID...",className:"w-full h-7 rounded-lg border border-white/10 bg-[#101726] pl-2 pr-16 text-[11px] text-text-primary outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/40"}),' +
        'e.jsx("button",{type:"button",onClick:async()=>{' +
          'let v=(n.tts?.voiceId||"").trim().replace(/^.*voices\\//i,"").replace(/^.*share\\//i,"").replace(/\\?.*$/,"").trim();' +
          'if(!v)return;' +
          'if(window.aiforge?.tts?.lookupSharedVoice){' +
            'try{' +
              'const res=await window.aiforge.tts.lookupSharedVoice(v);' +
              'if(res && (res.voiceName||res.name)){' +
                'const vName=res.voiceName||res.name;' +
                'R(n.id,{tts:{...(n.tts||{}),voiceId:v,voiceName:vName}});' +
                'const raw=window.localStorage.getItem("aiforge.ttsStudio.savedVoices.v1");' +
                'const sv=raw?JSON.parse(raw):[];' +
                'const updated=[{voiceId:v,voiceName:vName,source:"shared",savedAt:new Date().toISOString()},...sv.filter(x=>x&&x.voiceId!==v)];' +
                'window.localStorage.setItem("aiforge.ttsStudio.savedVoices.v1",JSON.stringify(updated));' +
              '}' +
            '}catch(_){}' +
          '}' +
        '},className:"absolute right-1 top-1 bottom-1 px-2 rounded bg-emerald-950/60 border border-emerald-500/40 text-[10px] font-bold text-emerald-300 hover:text-white cursor-pointer",children:"Nhận diện"})' +
      ']})' +
    ']}),' +
    'e.jsxs("div",{className:"flex flex-col gap-1",children:[' +
      'e.jsxs("div",{className:"flex items-center justify-between",children:[' +
        'e.jsx("label",{className:"text-[9px] font-semibold text-text-muted uppercase tracking-wider",children:"Lời thoại kịch bản (Dialogue Script)"}),' +
        'e.jsx("span",{className:"text-[8px] text-emerald-400 font-medium",children:"Tự nhận diện kịch bản nếu để trống"})' +
      ']}),' +
      'e.jsx("textarea",{value:n.tts?.script||"",onChange:p=>R(n.id,{tts:{...(n.tts||{}),script:p.target.value}}),placeholder:"Để trống để hệ thống TỰ ĐỘNG nhận diện kịch bản từ video Veo3/Grok, hoặc nhập câu thoại tiếng Việt tùy chỉnh...",rows:3,className:"w-full resize-y rounded-lg border border-white/10 bg-[#101726] p-2 text-xs leading-4 text-text-primary outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/40 placeholder:text-text-muted/60"})' +
    ']}),' +
    'e.jsxs("div",{className:"flex items-center justify-between gap-2",children:[' +
      'e.jsx("span",{className:"text-[9px] font-semibold text-text-muted uppercase tracking-wider",children:"Model TTS:"}),' +
      'e.jsxs("select",{value:n.tts?.modelId||"eleven_multilingual_v2",onChange:p=>R(n.id,{tts:{...(n.tts||{}),modelId:p.target.value}}),className:"h-6 rounded border border-white/10 bg-[#101726] px-1.5 text-[10px] text-text-primary outline-none",children:[' +
        'e.jsx("option",{value:"eleven_multilingual_v2",children:"Multilingual v2 (Chuẩn tiếng Việt & Tự nhiên nhất)"}),' +
        'e.jsx("option",{value:"eleven_flash_v2_5",children:"Flash v2.5 (Siêu tốc)"}),' +
        'e.jsx("option",{value:"eleven_turbo_v2_5",children:"Turbo v2.5 (Cân bằng)"})' +
      ']})' +
    ']})' +
  ']}))' +
']})';

// Apply Top Toolbar Banner
const tableAnchor = 'e.jsx("div",{ref:w,className:"max-h-[312px] overflow-auto"';
const tIdx = origCode.indexOf(tableAnchor);
let patched = origCode.slice(0, tIdx) + topToolbarBanner + ',' + origCode.slice(tIdx);

// Apply Inspector Section in function cn
const cnIdx = patched.indexOf('function cn(');
const promptSectionAnchor = 'e.jsxs("section",{className:"flex flex-col gap-1.5 rounded-lg border border-border-primary bg-bg-primary/25 p-3",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("label",{className:"text-[9px] font-bold text-text-muted uppercase tracking-wider select-none",children:"Prompt"})';
const pIdx = patched.indexOf(promptSectionAnchor, cnIdx);
patched = patched.slice(0, pIdx) + newInspectorSection + ',' + patched.slice(pIdx);

// Check syntax with node --check
fs.writeFileSync('temp_check_full.mjs', patched);
const { execSync } = require('child_process');
try {
  execSync('node --check temp_check_full.mjs', { stdio: 'inherit' });
  console.log('🎉🎉🎉 100% PERFECT! FULL MODULE SYNTAX VALIDATED WITHOUT ERRORS! 🎉🎉🎉');
} catch (e) {
  console.error('❌ Syntax error detected in full check!');
} finally {
  try { fs.unlinkSync('temp_check_full.mjs'); } catch (_) {}
}
