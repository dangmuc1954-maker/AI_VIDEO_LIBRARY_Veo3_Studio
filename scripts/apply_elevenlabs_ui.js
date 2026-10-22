const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('======================================================================');
console.log('🎙️ CẬP NHẬT GIAO DIỆN ELEVENLABS VOICE VÀO VIDEO STUDIO (PROMPT INSPECTOR)');
console.log('======================================================================');

const targetRoots = [
  path.join(__dirname, '../app'),
  path.join(__dirname, '../extracted_original'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Customer_Edition/resources/app')
];

const ttsInspectorSection = `e.jsxs("section",{className:"flex flex-col gap-2.5 rounded-lg border border-cyan-500/30 bg-cyan-950/30 p-3 shadow-[0_0_15px_rgba(6,182,212,0.08)]",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("label",{className:"text-[10px] font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5 cursor-pointer",onClick:()=>{const u=n.tts?.enabled;R(n.id,{tts:{enabled:!u,voiceId:n.tts?.voiceId||"21m00Tcm4TlvDq8ikWAM",voiceName:n.tts?.voiceName||"Rachel",script:n.tts?.script||"",modelId:n.tts?.modelId||"eleven_multilingual_v2"}})},children:["🎙️ Lồng Tiếng ElevenLabs"]}),e.jsx("button",{type:"button",onClick:()=>{const u=n.tts?.enabled;R(n.id,{tts:{enabled:!u,voiceId:n.tts?.voiceId||"21m00Tcm4TlvDq8ikWAM",voiceName:n.tts?.voiceName||"Rachel",script:n.tts?.script||"",modelId:n.tts?.modelId||"eleven_multilingual_v2"}})},className:\`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none \${n.tts?.enabled?"bg-cyan-500":"bg-white/10"}\`,children:e.jsx("span",{className:\`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out \${n.tts?.enabled?"translate-x-4":"translate-x-0"}\`})})]}),n.tts?.enabled&&e.jsxs("div",{className:"flex flex-col gap-2.5 pt-2 border-t border-cyan-500/20",children:[e.jsxs("div",{className:"flex flex-col gap-1",children:[e.jsx("label",{className:"text-[9px] font-semibold text-text-muted uppercase tracking-wider",children:"Chọn Giọng Đọc (Voice)"}),e.jsx("select",{value:n.tts?.voiceId||"21m00Tcm4TlvDq8ikWAM",onChange:p=>{const v=p.target.value,w=p.target.options[p.target.selectedIndex].text;R(n.id,{tts:{...(n.tts||{}),voiceId:v,voiceName:w}})},className:"w-full h-8 rounded-lg border border-white/10 bg-[#130f2480] px-2 text-xs text-text-primary outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40",children:[e.jsx("option",{value:"21m00Tcm4TlvDq8ikWAM",children:"Rachel (Nữ - Truyền cảm)"}),e.jsx("option",{value:"pNInz6obpgDQGcFmaJgB",children:"Adam (Nam - Trầm ấm, chuyên nghiệp)"}),e.jsx("option",{value:"ErXwobaYiN019PkySvjV",children:"Antoni (Nam - Tự nhiên, sinh động)"}),e.jsx("option",{value:"EXAVITQu4vr4xnSDxMaL",children:"Bella (Nữ - Trẻ trung, ngọt ngào)"}),e.jsx("option",{value:"VR6AewLTigWG4xSOukaG",children:"Arnold (Nam - Mạnh mẽ, dứt khoát)"}),e.jsx("option",{value:"AZnzlk1XvdvUeBnXmlld",children:"Domi (Nữ - Rõ ràng, lôi cuốn)"}),e.jsx("option",{value:"MF3mGyEYCl7XYWbV9V6O",children:"Elli (Nữ - Cảm xúc, tự nhiên)"}),e.jsx("option",{value:"TxGEqnHWrfWFTfGW9XjX",children:"Josh (Nam - Trẻ trung, tự tin)"})]})]}),e.jsxs("div",{className:"flex flex-col gap-1",children:[e.jsx("label",{className:"text-[9px] font-semibold text-text-muted uppercase tracking-wider",children:"Hoặc Dán Voice ID / Link ElevenLabs"}),e.jsx("input",{type:"text",value:n.tts?.voiceId||"",onChange:p=>{const v=p.target.value.trim().replace(/^.*voices\\//i,"").replace(/\\?.*$/,"");R(n.id,{tts:{...(n.tts||{}),voiceId:v,voiceName:v?\`Custom (\${v.slice(0,6)}...)\`:""}})},placeholder:"Nhập Voice ID bất kỳ (ví dụ: 21m00Tcm4TlvDq8ikWAM)...",className:"w-full h-7 rounded-lg border border-white/10 bg-[#130f2480] px-2 text-[11px] text-text-primary outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40"})]}),e.jsxs("div",{className:"flex flex-col gap-1",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("label",{className:"text-[9px] font-semibold text-text-muted uppercase tracking-wider",children:"Lời thoại nhân vật (Dialogue Script)"}),e.jsx("span",{className:"text-[8px] text-cyan-400 font-medium",children:"Đồng bộ giọng với video"})]}),e.jsx("textarea",{value:n.tts?.script||"",onChange:p=>R(n.id,{tts:{...(n.tts||{}),script:p.target.value}}),placeholder:"Nhập câu thoại của nhân vật trong phân cảnh này...",rows:3,className:"w-full resize-y rounded-lg border border-white/10 bg-[#130f2480] p-2 text-xs leading-4 text-text-primary outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 placeholder:text-text-muted/60"})]}),e.jsxs("div",{className:"flex items-center justify-between gap-2",children:[e.jsx("span",{className:"text-[9px] font-semibold text-text-muted uppercase tracking-wider",children:"Model TTS:"}),e.jsx("select",{value:n.tts?.modelId||"eleven_multilingual_v2",onChange:p=>R(n.id,{tts:{...(n.tts||{}),modelId:p.target.value}}),className:"h-6 rounded border border-white/10 bg-[#130f2480] px-1.5 text-[10px] text-text-primary outline-none",children:[e.jsx("option",{value:"eleven_multilingual_v2",children:"Multilingual v2 (Chuẩn tiếng Việt)"}),e.jsx("option",{value:"eleven_flash_v2_5",children:"Flash v2.5 (Siêu tốc)"}),e.jsx("option",{value:"eleven_turbo_v2_5",children:"Turbo v2.5 (Cân bằng)"})]})]})]})]}),`;

for (const root of targetRoots) {
  if (!fs.existsSync(root)) continue;
  const vsPath = path.join(root, 'out/renderer/assets/VideoStudio-BZY_1pM8.js');
  if (!fs.existsSync(vsPath)) continue;

  console.log('[*] Đang xử lý UI VideoStudio tại:', vsPath);
  let code = fs.readFileSync(vsPath, 'utf8');

  // Find exact anchor in Inspector: right after the Phân cảnh input section
  const targetAnchor = 'focus:ring-violet-400/40"})]}),';
  if (code.includes(targetAnchor)) {
    if (!code.includes('Lồng Tiếng ElevenLabs')) {
      code = code.replace(targetAnchor, targetAnchor + ttsInspectorSection);
      console.log('  ✓ Đã chèn thành công mục [🎙️ Lồng Tiếng ElevenLabs] vào Inspector!');
    } else {
      console.log('  [-] Đã có sẵn mục Lồng Tiếng ElevenLabs');
    }
  } else {
    console.warn('  ⚠️ Không tìm thấy targetAnchor trong:', vsPath);
  }

  fs.writeFileSync(vsPath, code, 'utf8');
}

console.log('\n🌟 ĐÃ CẬP NHẬT XONG GIAO DIỆN! 🌟');
