const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('======================================================================');
console.log('🎙️ TÍCH HỢP ELEVENLABS VOICE VÀO VIDEO STUDIO (VEO3 & GROK) 🎙️');
console.log('======================================================================');

const targetRoots = [
  path.join(__dirname, '../app'),
  path.join(__dirname, '../extracted_original'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Customer_Edition/resources/app')
];

// 1. Patch VideoStudio Renderer
function patchVideoStudio(videoStudioPath) {
  if (!fs.existsSync(videoStudioPath)) return;
  console.log('[*] Đang nâng cấp UI VideoStudio:', videoStudioPath);
  let code = fs.readFileSync(videoStudioPath, 'utf8');

  // 1.1 Update default scene object kt() to include tts config
  const oldKt = 'negativePrompt:s?.negativePrompt||"",referenceAssetIds:[]}}';
  const newKt = 'negativePrompt:s?.negativePrompt||"",tts:s?.tts||{enabled:!1,voiceId:"21m00Tcm4TlvDq8ikWAM",voiceName:"Rachel",script:"",modelId:"eleven_multilingual_v2"},referenceAssetIds:[]}}';
  if (code.includes(oldKt) && !code.includes('tts:s?.tts')) {
    code = code.replace(oldKt, newKt);
    console.log('  ✓ Đã thêm tts config vào hàm khởi tạo phân cảnh kt()');
  }

  // 1.2 Update Grok and Veo3 job submission payloads to include tts
  const oldGrokPayload = 'model:"grok-imagine-video",outputIndex:';
  const newGrokPayload = 'model:"grok-imagine-video",tts:f.tts?.enabled&&f.tts?.script?.trim()?{enabled:!0,voiceId:f.tts.voiceId||"21m00Tcm4TlvDq8ikWAM",voiceName:f.tts.voiceName||"Rachel",script:f.tts.script.trim(),modelId:f.tts.modelId||"eleven_multilingual_v2"}:void 0,outputIndex:';
  if (code.includes(oldGrokPayload) && !code.includes('tts:f.tts?.enabled')) {
    code = code.replace(oldGrokPayload, newGrokPayload);
    console.log('  ✓ Đã tích hợp tts payload cho Grok Video');
  }

  // Veo3 payload target: model:f.model,creditCost:
  const oldVeoPayload = 'model:f.model,creditCost:';
  const newVeoPayload = 'model:f.model,tts:f.tts?.enabled&&f.tts?.script?.trim()?{enabled:!0,voiceId:f.tts.voiceId||"21m00Tcm4TlvDq8ikWAM",voiceName:f.tts.voiceName||"Rachel",script:f.tts.script.trim(),modelId:f.tts.modelId||"eleven_multilingual_v2"}:void 0,creditCost:';
  if (code.includes(oldVeoPayload) && !code.includes('tts:f.tts?.enabled')) {
    code = code.replace(oldVeoPayload, newVeoPayload);
    console.log('  ✓ Đã tích hợp tts payload cho Veo 3 Video');
  }

  // 1.3 Add ElevenLabs Voiceover section into Inspector Component cn
  const sceneNameSectionRegex = /e\.jsx\(["']input["'],\{type:["']text["'],value:n\.sceneName\|\|`Phân cảnh \$\{n\.index\}`[^}]+\}\)\s*\]\}\),/g;

  const ttsInspectorSection = `e.jsxs("section",{className:"flex flex-col gap-2.5 rounded-lg border border-cyan-500/25 bg-cyan-950/20 p-3 shadow-[0_0_15px_rgba(6,182,212,0.06)]",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("label",{className:"text-[10px] font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5 cursor-pointer",onClick:()=>{const u=n.tts?.enabled;R(n.id,{tts:{enabled:!u,voiceId:n.tts?.voiceId||"21m00Tcm4TlvDq8ikWAM",voiceName:n.tts?.voiceName||"Rachel",script:n.tts?.script||"",modelId:n.tts?.modelId||"eleven_multilingual_v2"}})},children:["🎙️ ElevenLabs Voice (Lồng tiếng)"]}),e.jsx("button",{type:"button",onClick:()=>{const u=n.tts?.enabled;R(n.id,{tts:{enabled:!u,voiceId:n.tts?.voiceId||"21m00Tcm4TlvDq8ikWAM",voiceName:n.tts?.voiceName||"Rachel",script:n.tts?.script||"",modelId:n.tts?.modelId||"eleven_multilingual_v2"}})},className:\`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none \${n.tts?.enabled?"bg-cyan-500":"bg-white/10"}\`,children:e.jsx("span",{className:\`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out \${n.tts?.enabled?"translate-x-4":"translate-x-0"}\`})})]}),n.tts?.enabled&&e.jsxs("div",{className:"flex flex-col gap-2.5 pt-1 border-t border-cyan-500/15",children:[e.jsxs("div",{className:"flex flex-col gap-1",children:[e.jsx("label",{className:"text-[9px] font-semibold text-text-muted uppercase tracking-wider",children:"Chọn Giọng Đọc (Voice Preset)"}),e.jsx("select",{value:n.tts?.voiceId||"21m00Tcm4TlvDq8ikWAM",onChange:p=>{const v=p.target.value,w=p.target.options[p.target.selectedIndex].text;R(n.id,{tts:{...(n.tts||{}),voiceId:v,voiceName:w}})},className:"w-full h-8 rounded-lg border border-white/10 bg-[#130f2480] px-2 text-xs text-text-primary outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40",children:[e.jsx("option",{value:"21m00Tcm4TlvDq8ikWAM",children:"Rachel (Nữ - Truyền cảm)"}),e.jsx("option",{value:"pNInz6obpgDQGcFmaJgB",children:"Adam (Nam - Trầm ấm, chuyên nghiệp)"}),e.jsx("option",{value:"ErXwobaYiN019PkySvjV",children:"Antoni (Nam - Tự nhiên, sinh động)"}),e.jsx("option",{value:"EXAVITQu4vr4xnSDxMaL",children:"Bella (Nữ - Trẻ trung, ngọt ngào)"}),e.jsx("option",{value:"VR6AewLTigWG4xSOukaG",children:"Arnold (Nam - Mạnh mẽ, dứt khoát)"}),e.jsx("option",{value:"AZnzlk1XvdvUeBnXmlld",children:"Domi (Nữ - Rõ ràng, lôi cuốn)"}),e.jsx("option",{value:"MF3mGyEYCl7XYWbV9V6O",children:"Elli (Nữ - Cảm xúc, tự nhiên)"}),e.jsx("option",{value:"TxGEqnHWrfWFTfGW9XjX",children:"Josh (Nam - Trẻ trung, tự tin)"})]})]}),e.jsxs("div",{className:"flex flex-col gap-1",children:[e.jsx("label",{className:"text-[9px] font-semibold text-text-muted uppercase tracking-wider",children:"Hoặc dán Voice ID / Link ElevenLabs"}),e.jsx("input",{type:"text",value:n.tts?.voiceId||"",onChange:p=>{const v=p.target.value.trim().replace(/^.*voices\\//i,"").replace(/\\?.*$/,"");R(n.id,{tts:{...(n.tts||{}),voiceId:v,voiceName:v?\`Custom (\${v.slice(0,6)}...)\`:""}})},placeholder:"Nhập Voice ID bất kỳ (ví dụ: 21m00Tcm4TlvDq8ikWAM)...",className:"w-full h-7 rounded-lg border border-white/10 bg-[#130f2480] px-2 text-[11px] text-text-primary outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40"})]}),e.jsxs("div",{className:"flex flex-col gap-1",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("label",{className:"text-[9px] font-semibold text-text-muted uppercase tracking-wider",children:"Lời thoại nhân vật (Dialogue Script)"}),e.jsx("span",{className:"text-[8px] text-cyan-400 font-medium",children:"Đồng bộ giọng với video"})]}),e.jsx("textarea",{value:n.tts?.script||"",onChange:p=>R(n.id,{tts:{...(n.tts||{}),script:p.target.value}}),placeholder:"Nhập câu thoại của nhân vật trong phân cảnh này...",rows:3,className:"w-full resize-y rounded-lg border border-white/10 bg-[#130f2480] p-2 text-xs leading-4 text-text-primary outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 placeholder:text-text-muted/60"})]}),e.jsxs("div",{className:"flex items-center justify-between gap-2",children:[e.jsx("span",{className:"text-[9px] font-semibold text-text-muted uppercase tracking-wider",children:"Model TTS:"}),e.jsx("select",{value:n.tts?.modelId||"eleven_multilingual_v2",onChange:p=>R(n.id,{tts:{...(n.tts||{}),modelId:p.target.value}}),className:"h-6 rounded border border-white/10 bg-[#130f2480] px-1.5 text-[10px] text-text-primary outline-none",children:[e.jsx("option",{value:"eleven_multilingual_v2",children:"Multilingual v2 (Chuẩn tiếng Việt & Đa ngôn ngữ)"}),e.jsx("option",{value:"eleven_flash_v2_5",children:"Flash v2.5 (Siêu tốc)"}),e.jsx("option",{value:"eleven_turbo_v2_5",children:"Turbo v2.5 (Cân bằng)"})]})]})]})]}),`;

  if (!code.includes('ElevenLabs Voice (Lồng tiếng)')) {
    code = code.replace(sceneNameSectionRegex, match => {
      return match + ttsInspectorSection;
    });
    console.log('  ✓ Đã chèn giao diện ElevenLabs Voiceover vào Inspector');
  }

  fs.writeFileSync(videoStudioPath, code, 'utf8');
}

// 2. Patch Main Process Pipeline
function patchMainProcess(mainPath) {
  if (!fs.existsSync(mainPath)) return;
  console.log('[*] Đang nâng cấp Main Process Pipeline:', mainPath);
  let code = fs.readFileSync(mainPath, 'utf8');

  // Inject ElevenLabs TTS + FFmpeg voiceover merging right after cacheQueueResult
  const targetCommit = 'const c=await this.assets.cacheQueueResult(n,a),d=this.queue.findJob(e.id);';

  const ttsMergeCode = `const c=await this.assets.cacheQueueResult(n,a);
  if(n.payload?.tts?.enabled&&n.payload?.tts?.script?.trim()&&c.assets?.length>0){
    const vidAsset=c.assets.find(ast=>ast.type==="video");
    if(vidAsset&&vidAsset.localPath&&ye(vidAsset.localPath)){
      try{
        this.queue.updateJobProgress(e.id,90,"Đang tạo giọng đọc ElevenLabs...");
        const tData=n.payload.tts,vId=tData.voiceId||"21m00Tcm4TlvDq8ikWAM",mId=tData.modelId||"eleven_multilingual_v2",sText=tData.script.trim();
        let aBuf=null;
        try{
          const eRunner=this.runtimes.get("elevenlabs","TTS");
          if(eRunner&&eRunner.ttsClient){
            const sRes=await eRunner.ttsClient.synthesize({voiceId:vId,modelId:mId,text:sText,voiceSettings:{stability:.5,similarity_boost:.75}},{signal:t});
            sRes&&sRes.audioBytes&&(aBuf=sRes.audioBytes);
          }
        }catch(err){console.warn("[Voiceover Runner Synth Notice]",err.message)}
        if(!aBuf){
          try{
            const dRes=await fetch("https://api.elevenlabs.io/v1/text-to-speech/"+encodeURIComponent(vId),{
              method:"POST",
              headers:{"Content-Type":"application/json","Accept":"audio/mpeg"},
              body:JSON.stringify({text:sText,model_id:mId,voice_settings:{stability:.5,similarity_boost:.75}}),
              signal:t
            });
            if(dRes.ok){
              const aArr=await dRes.arrayBuffer();
              aBuf=Buffer.from(aArr);
            }
          }catch(err){console.warn("[Voiceover Direct API Notice]",err.message)}
        }
        if(aBuf&&aBuf.length>0){
          this.queue.updateJobProgress(e.id,95,"Đang ghép giọng đọc vào video...");
          const fBin=await oa(t);
          const tAudio=N(this.assets.filesDir,\`temp_voice_\${M()}.mp3\`);
          const tVoiced=N(this.assets.filesDir,\`temp_voiced_\${M()}.mp4\`);
          await ut(tAudio,aBuf);
          await fr(fBin,["-y","-i",vidAsset.localPath,"-i",tAudio,"-map","0:v:0","-map","1:a:0","-c:v","copy","-c:a","aac","-b:a","192k","-shortest","-movflags","+faststart",tVoiced],Pt,t);
          if(ye(tVoiced)){
            await Zc(tVoiced,vidAsset.localPath);
            try{await We(tVoiced)}catch(e){}
            try{await We(tAudio)}catch(e){}
            console.log("[ElevenLabs Voiceover] Successfully voiced video:",vidAsset.localPath);
          }
        }
      }catch(tErr){console.error("[ElevenLabs Voiceover Merge Error]",tErr)}
    }
  }
  const d=this.queue.findJob(e.id);`;

  if (code.includes(targetCommit) && !code.includes('ElevenLabs Voiceover')) {
    code = code.replace(targetCommit, ttsMergeCode);
    console.log('  ✓ Đã tiêm pipeline lồng tiếng tự động vào Main Process');
  }

  fs.writeFileSync(mainPath, code, 'utf8');
}

for (const root of targetRoots) {
  if (!fs.existsSync(root)) continue;
  console.log('\n--- Xử lý tại:', root, '---');
  patchVideoStudio(path.join(root, 'out/renderer/assets/VideoStudio-BZY_1pM8.js'));
  patchMainProcess(path.join(root, 'out/main/index.js'));
}

// 3. Syntax Verification
console.log('\n[*] Kiểm tra tính toàn vẹn cú pháp sau khi tích hợp...');
for (const root of targetRoots) {
  const mainPath = path.join(root, 'out/main/index.js');
  if (fs.existsSync(mainPath)) {
    try {
      execSync(`node --check "${mainPath}"`, { stdio: 'inherit' });
      console.log('  [PASS] Cú pháp Main Process chuẩn xác:', mainPath);
    } catch (err) {
      console.error('  [FAIL] Lỗi trong:', mainPath);
      process.exit(1);
    }
  }
}

console.log('\n🎉 HOÀN TẤT TÍCH HỢP ELEVENLABS VÀO VIDEO STUDIO THÀNH CÔNG! 🎉');
