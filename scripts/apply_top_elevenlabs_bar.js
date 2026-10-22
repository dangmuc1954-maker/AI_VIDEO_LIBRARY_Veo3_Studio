const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('======================================================================');
console.log('🎙️ CHÈN THANH ĐIỀU KHIỂN ELEVENLABS VOICE NGAY ĐẦU BẢNG VIDEO QUEUE');
console.log('======================================================================');

const targetRoots = [
  path.join(__dirname, '../app'),
  path.join(__dirname, '../extracted_original'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Customer_Edition/resources/app')
];

const topToolbarBanner = `e.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-3 border-b border-cyan-500/30 bg-gradient-to-r from-cyan-950/70 via-[#130f24] to-cyan-950/50 px-4 py-2.5 shadow-md",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsxs("div",{className:"flex items-center gap-2 cursor-pointer select-none",onClick:()=>{if(d){const u=d.tts?.enabled;V(d.id,{tts:{enabled:!u,voiceId:d.tts?.voiceId||"21m00Tcm4TlvDq8ikWAM",voiceName:d.tts?.voiceName||"Rachel",script:d.tts?.script||"",modelId:d.tts?.modelId||"eleven_multilingual_v2"}})}},children:[e.jsx("span",{className:"text-base animate-pulse",children:"🎙️"}),e.jsxs("div",{children:[e.jsx("span",{className:"text-xs font-bold text-cyan-300 uppercase tracking-wider block",children:"Lồng Tiếng ElevenLabs"}),e.jsx("span",{className:"text-[10px] text-text-muted block",children:d?\`Phân cảnh #\${d.index}: \${d.tts?.enabled?"Đang bật giọng "+(d.tts?.voiceName||"Rachel"):"Chưa bật"}\`:"Tự động ghép giọng vào video"})]})]}),e.jsxs("button",{type:"button",onClick:()=>{if(d){const u=d.tts?.enabled;V(d.id,{tts:{enabled:!u,voiceId:d.tts?.voiceId||"21m00Tcm4TlvDq8ikWAM",voiceName:d.tts?.voiceName||"Rachel",script:d.tts?.script||"",modelId:d.tts?.modelId||"eleven_multilingual_v2"}})}},className:\`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer shadow-sm \${d?.tts?.enabled?"bg-cyan-500 text-black border-cyan-400 font-extrabold shadow-cyan-500/30":"bg-white/10 text-white/70 border-white/20 hover:border-cyan-400 hover:text-white"}\`,children:[e.jsx("span",{className:\`w-2 h-2 rounded-full \${d?.tts?.enabled?"bg-black":"bg-text-muted"}\`}),d?.tts?.enabled?"ĐANG BẬT":"TẮT"]}),e.jsx("button",{type:"button",title:"Bật/Tắt lồng tiếng cho TẤT CẢ các phân cảnh",onClick:()=>{const tg=!(d?.tts?.enabled);G.forEach(rw=>{V(rw.id,{tts:{enabled:tg,voiceId:rw.tts?.voiceId||d?.tts?.voiceId||"21m00Tcm4TlvDq8ikWAM",voiceName:rw.tts?.voiceName||d?.tts?.voiceName||"Rachel",script:rw.tts?.script||"",modelId:rw.tts?.modelId||"eleven_multilingual_v2"}})})},className:"text-[10px] font-semibold text-cyan-400/90 hover:text-cyan-300 underline underline-offset-2 ml-1 cursor-pointer",children:d?.tts?.enabled?"Áp dụng tất cả":"Bật cho tất cả"})]}),d?.tts?.enabled?e.jsxs("div",{className:"flex flex-1 min-w-[300px] max-w-[650px] items-center gap-2 justify-end",children:[e.jsx("select",{value:d.tts?.voiceId||"21m00Tcm4TlvDq8ikWAM",onChange:p=>{const v=p.target.value,w=p.target.options[p.target.selectedIndex].text;V(d.id,{tts:{...(d.tts||{}),voiceId:v,voiceName:w}})},className:"h-7 rounded-lg border border-cyan-500/40 bg-[#130f24] px-2 text-[11px] font-medium text-cyan-200 outline-none focus:border-cyan-400 shrink-0",children:[e.jsx("option",{value:"21m00Tcm4TlvDq8ikWAM",children:"Rachel (Nữ)"}),e.jsx("option",{value:"pNInz6obpgDQGcFmaJgB",children:"Adam (Nam)"}),e.jsx("option",{value:"ErXwobaYiN019PkySvjV",children:"Antoni (Nam)"}),e.jsx("option",{value:"EXAVITQu4vr4xnSDxMaL",children:"Bella (Nữ)"}),e.jsx("option",{value:"VR6AewLTigWG4xSOukaG",children:"Arnold (Nam)"}),e.jsx("option",{value:"AZnzlk1XvdvUeBnXmlld",children:"Domi (Nữ)"}),e.jsx("option",{value:"MF3mGyEYCl7XYWbV9V6O",children:"Elli (Nữ)"}),e.jsx("option",{value:"TxGEqnHWrfWFTfGW9XjX",children:"Josh (Nam)"})]}),e.jsx("input",{type:"text",value:d.tts?.voiceId||"",onChange:p=>{const v=p.target.value.trim().replace(/^.*voices\\//i,"").replace(/\\?.*$/,"");V(d.id,{tts:{...(d.tts||{}),voiceId:v,voiceName:v?\`Custom (\${v.slice(0,6)}...)\`:""}})},placeholder:"Voice ID...",className:"w-24 h-7 rounded-lg border border-white/15 bg-[#130f24] px-2 text-[10px] text-text-primary outline-none focus:border-cyan-400 shrink-0"}),e.jsx("input",{type:"text",value:d.tts?.script||"",onChange:p=>V(d.id,{tts:{...(d.tts||{}),script:p.target.value}}),placeholder:\`Nhập lời thoại nhân vật cho Phân cảnh #\${d.index}...\`,className:"flex-1 h-7 rounded-lg border border-cyan-500/50 bg-[#130f24] px-2.5 text-xs text-white placeholder:text-text-muted/60 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40"})]}):e.jsx("div",{className:"text-[11px] text-text-muted italic",children:"Bấm nút [TẮT / ĐANG BẬT] ở trên để lồng tiếng ElevenLabs cho phân cảnh này"})]}),`;

for (const root of targetRoots) {
  if (!fs.existsSync(root)) continue;
  const vsPath = path.join(root, 'out/renderer/assets/VideoStudio-BZY_1pM8.js');
  if (!fs.existsSync(vsPath)) continue;

  console.log('[*] Đang chèn thanh điều khiển ElevenLabs ngay đầu bảng Video Queue tại:', vsPath);
  let code = fs.readFileSync(vsPath, 'utf8');

  // Locate the Video Queue header bar end
  const headerAnchor = 'e.jsx("span",{children:sr($,"video")})]})]}),';
  if (code.includes(headerAnchor)) {
    if (!code.includes('Phân cảnh #${d.index}')) {
      code = code.replace(headerAnchor, headerAnchor + topToolbarBanner);
      console.log('  ✓ Đã chèn thành công thanh điều khiển ElevenLabs ngay đầu bảng Video!');
    } else {
      console.log('  [-] Đã có sẵn thanh điều khiển đầu bảng');
    }
  } else {
    console.warn('  ⚠️ Không tìm thấy headerAnchor trong:', vsPath);
  }

  fs.writeFileSync(vsPath, code, 'utf8');
}

console.log('\n🌟 HOÀN TẤT CHÈN THANH ĐIỀU KHIỂN ELEVENLABS NGAY ĐẦU BẢNG VIDEO! 🌟');
