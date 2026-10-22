const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('======================================================================');
console.log('🎬 UPGRADE ELEVENLABS V3 NATIVE DUBBING & DIALOGUE SYNCHRONIZATION 🎬');
console.log('======================================================================');

const targetRoots = [
  path.join(__dirname, '../app'),
  path.join(__dirname, '../extracted_original'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Customer_Edition/resources/app'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Khach_Hang_v3.0/resources/app')
];

// ============================================================================
// 1. GENERATE SMART CONTEXTUAL DIALOGUE HELPER FUNCTION CODE
// ============================================================================
const smartDialogueFunctionCode = `
function generateSmartContextualDialogue(rawPrompt, vidDuration, voiceName, sceneIdx) {
  const p = (rawPrompt || "").trim();
  const lower = p.toLowerCase();
  const sIdx = Number.isInteger(sceneIdx) ? sceneIdx : 1;
  const isFemale = /nữ|gái|bạn nữ|cô gái|chị|em|bà|female|woman|girl|beauty|xinh|gala|gais/i.test(lower + " " + (voiceName || ""));
  const self = "mình";

  // 1. Quoted speech or explicit dialogue marker in prompt
  const quoteMatch = p.match(/["“'«]([^"”'»]{3,})["”'»]/);
  if (quoteMatch && quoteMatch[1].trim()) {
    return quoteMatch[1].trim();
  }
  const speechMarker = p.match(/(?:thoại|lời thoại|kịch bản|nói|bảo|says?|speaking|speaks)\\s*[:：]\\s*([^,.;\\n]+)/i);
  if (speechMarker && speechMarker[1].trim().length > 3) {
    return speechMarker[1].trim();
  }

  // 2. Multi-scene Backpack / Bag / Fashion Review
  if (/balo|ba lô|túi|backpack|bag/i.test(lower)) {
    if (sIdx <= 1) {
      if (vidDuration <= 6) return "Chào các bạn, hôm nay " + self + " sẽ review chiếc ba lô siêu xinh và cực kỳ tiện lợi này nhé.";
      return "Xin chào tất cả các bạn! Hôm nay " + self + " rất vui được giới thiệu chiếc ba lô cực kỳ xinh xắn và tiện ích này nhé.";
    } else if (sIdx === 2) {
      if (vidDuration <= 6) return "Chất liệu của ba lô rất bền đẹp, các ngăn chứa đồ cực kỳ rộng rãi và dễ sắp xếp.";
      return "Điểm mình thích nhất là chất liệu chống thấm cực tốt, các ngăn chứa đồ rộng rãi và quai đeo vô cùng êm ái.";
    } else {
      if (vidDuration <= 6) return "Một chiếc ba lô quá hoàn hảo cho cả đi học lẫn đi chơi, các bạn nhớ trải nghiệm nhé!";
      return "Tổng thể chiếc ba lô này quá ưng ý và tiện dụng, các bạn nhất định đừng bỏ qua em nó nhé!";
    }
  }

  // 3. Clothing / Fashion / Shoes
  if (/áo|quần|váy|đầm|giày|dép|thời trang|outfit|fashion|dress|shoes/i.test(lower)) {
    if (sIdx <= 1) {
      return "Chào các bạn, hôm nay " + self + " gợi ý cho mọi người một set đồ cực kỳ tôn dáng và thời thượng nhé.";
    } else if (sIdx === 2) {
      return "Phom dáng của trang phục lên form rất chuẩn, chất vải thoáng mát và dễ dàng phối đồ hằng ngày.";
    } else {
      return "Set đồ này vừa thanh lịch lại vừa trẻ trung, diện đi làm hay đi cà phê cùng bạn bè đều rất nổi bật!";
    }
  }

  // 4. Beauty / Cosmetics / Skincare
  if (/mỹ phẩm|son|kem|skincare|trang điểm|makeup|làm đẹp|da/i.test(lower)) {
    if (sIdx <= 1) {
      return "Chào các bạn, hôm nay " + self + " chia sẻ bí quyết chăm sóc sắc đẹp đơn giản mà cực kỳ hiệu quả này nhé.";
    } else if (sIdx === 2) {
      return "Cảm giác khi thoa lên da rất mỏng nhẹ, thẩm thấu nhanh và mang lại làn da căng bóng mịn màng.";
    } else {
      return "Một sản phẩm làm đẹp chân ái mà các nàng nhất định phải có trong túi đồ của mình nha!";
    }
  }

  // 5. Food / Cafe / Dining
  if (/cà phê|cafe|quán|ăn|món|ẩm thực|nấu|food|coffee|tiệm/i.test(lower)) {
    if (sIdx <= 1) {
      return "Xin chào các bạn, hôm nay cùng theo chân " + self + " khám phá một không gian quán siêu chill này nhé.";
    } else if (sIdx === 2) {
      return "Hương vị đồ uống ở đây thực sự rất thơm ngon, decor góc nào lên hình cũng lung linh xuất sắc.";
    } else {
      return "Một địa điểm hoàn hảo để thư giãn cuối tuần cùng bạn bè, các bạn nhớ ghé trải nghiệm nha!";
    }
  }

  // 6. Technology / Gadgets / Phone
  if (/công nghệ|điện thoại|phone|laptop|máy|tech|ai|gadget/i.test(lower)) {
    if (sIdx <= 1) {
      return "Chào các bạn, trên tay " + self + " hôm nay là một thiết bị công nghệ với thiết kế cực kỳ hiện đại.";
    } else if (sIdx === 2) {
      return "Hiệu năng xử lý vô cùng mượt mà, nhiều tính năng thông minh đáp ứng trọn vẹn nhu cầu công việc.";
    } else {
      return "Đây chắc chắn là một sự nâng cấp đáng giá trong phân khúc, các bạn cùng tham khảo nhé!";
    }
  }

  // 7. General Scene Action Dialogue (Clean and Natural)
  let cleanDesc = p.replace(/^(tạo video|cảnh quay|video về|hình ảnh|cinematic video of|a video of|close up of)\\s*:?\\s*/i, "").trim();
  if (cleanDesc.length > 5) {
    if (vidDuration <= 6) {
      return "Chào các bạn, cùng " + self + " theo dõi những khoảnh khắc thú vị ngay sau đây nhé!";
    }
    return "Xin chào tất cả các bạn, chào mừng các bạn đến với video, hãy cùng " + self + " khám phá ngay nhé!";
  }

  return "Chào các bạn, chào mừng các bạn đã theo dõi video ngày hôm nay cùng mình nhé!";
}
`;

// ============================================================================
// 2. PATCH MAIN PROCESS (app/out/main/index.js)
// ============================================================================
function patchMain(mainPath) {
  if (!fs.existsSync(mainPath)) return;
  console.log('\n[*] Đang vá Main Process:', mainPath);
  let code = fs.readFileSync(mainPath, 'utf8');

  // 2.1 Ensure generateSmartContextualDialogue is injected
  if (!code.includes('function generateSmartContextualDialogue')) {
    code = smartDialogueFunctionCode + '\n' + code;
    console.log('  ✓ Đã thêm generateSmartContextualDialogue');
  }

  // 2.2 Patch the Voiceover Pipeline around cacheQueueResult
  const hookStart = code.indexOf('if(n.payload?.tts?.enabled && c.assets?.length>0)');
  const hookEnd = code.indexOf('const d=this.queue.findJob(e.id);if(t.aborted||!d||d.status==="Canceled")', hookStart);

  if (hookStart !== -1 && hookEnd !== -1) {
    const upgradedPipelineCode = `if(n.payload?.tts?.enabled && c.assets?.length>0){
    const vidAsset=c.assets.find(ast=>(ast.type||"").toLowerCase()==="video");
    if(vidAsset && vidAsset.localPath && nodeFs.existsSync(vidAsset.localPath)){
      try{
        const tData=n.payload.tts;
        let vId=((tData.voiceId||"").trim()||"tQ4MEZFJOzsahSEEZtHK");
        // Normalize alias for em gala xinh
        if(vId==="IQXM092JC4uN1BHfZZhX" || vId==="★ em gais xinh" || vId==="★★★ em gala xinh") {
          vId="tQ4MEZFJOzsahSEEZtHK";
        }
        const mId=((tData.modelId||"").trim()||"eleven_multilingual_v2");
        const vName=((tData.voiceName||"").trim()||vId);
        const fBin=await oa(t);

        // 1. Lấy thời lượng thực tế của video Veo3
        let vidDuration=8.0;
        try{
          const pInfo=await bo(fBin,vidAsset.localPath,t);
          if(pInfo && Number.isFinite(pInfo.duration) && pInfo.duration>0){
            vidDuration=pInfo.duration;
          }
        }catch(_){}

        // 2. Bắt kịch bản nói chính xác
        let sText=((tData && tData.script) || "").trim();
        if(!sText){
          const sOrder=n.payload?.promptOrder||n.payload?.sceneIndex||1;
          sText=generateSmartContextualDialogue(n.payload?.prompt||n.title||"",vidDuration,vName,sOrder);
        }
        sText=sText.replace(/\\s+/g," ").trim();
        if(sText && !/[.!?]$/.test(sText)) sText+=".";

        this.queue.updateJobProgress(e.id,88,"Đang tạo giọng đọc ElevenLabs ("+vName+")...");
        console.log("[ElevenLabs Voiceover] Bắt kịch bản thoại:", sText, "| Voice:", vName, "(" + vId + ") | Model:", mId);
        let aBuf=null;

        // 3. Gọi ElevenLabs TTS Runtime chuẩn của ứng dụng (không bị timeout 10s)
        try{
          const eRunner=this.runtimes.get("elevenlabs","TTS");
          if(eRunner){
            const ttsJob={
              id:"voiceover-"+e.id+"-"+Date.now(),
              type:"TTS",
              providerId:"elevenlabs",
              title:sText.slice(0,100),
              payload:{
                prompt:sText,
                voiceId:vId,
                modelId:mId,
                language:"vi",
                languageCode:"vi",
                voiceSettings:{
                  stability:typeof tData.stability==="number"?tData.stability:0.50,
                  similarity_boost:typeof tData.similarityBoost==="number"?tData.similarityBoost:0.75,
                  speed:typeof tData.speed==="number"?tData.speed:1.0,
                  style:typeof tData.style==="number"?tData.style:0.0,
                  use_speaker_boost:tData.useSpeakerBoost!==false
                }
              }
            };

            // Thực thi với thời gian chờ chuẩn 90s của queue
            const ttsResult=await eRunner.runJob(ttsJob,{
              signal:t,
              updateProgress:(p,msg)=>this.queue.updateJobProgress(e.id,Math.min(94,88+Math.round((p||0)*0.06)),"ElevenLabs: "+(msg||"Đang tạo giọng nói chuẩn"))
            });

            const aAsset=ttsResult?.assets?.find(x=>x.type==="audio");
            if(aAsset?.url){
              if(aAsset.url.startsWith("data:audio")){
                const b64=aAsset.url.replace(/^data:audio\\/[^;]+;base64,/,"");
                aBuf=Buffer.from(b64,"base64");
              }else if(aAsset.url.startsWith("http")){
                const fRes=await fetch(aAsset.url,{signal:t});
                if(fRes.ok) aBuf=Buffer.from(await fRes.arrayBuffer());
              }
            }
          }
        }catch(runnerErr){
          console.warn("[ElevenLabs Runner Primary Notice]",runnerErr.message||runnerErr);
          // Fallback ElevenLabs model retry (eleven_multilingual_v2 if v3 had quota limits)
          if(mId!=="eleven_multilingual_v2"){
            try{
              console.log("[ElevenLabs] Retrying with eleven_multilingual_v2...");
              const eRunner=this.runtimes.get("elevenlabs","TTS");
              if(eRunner){
                const retryJob={
                  id:"voiceover-retry-"+e.id+"-"+Date.now(),
                  type:"TTS",
                  providerId:"elevenlabs",
                  title:sText.slice(0,100),
                  payload:{
                    prompt:sText,
                    voiceId:vId,
                    modelId:"eleven_multilingual_v2",
                    language:"vi",
                    languageCode:"vi",
                    voiceSettings:{stability:0.5,similarity_boost:0.75}
                  }
                };
                const retryResult=await eRunner.runJob(retryJob,{signal:t,updateProgress:()=>{}});
                const rAst=retryResult?.assets?.find(x=>x.type==="audio");
                if(rAst?.url?.startsWith("data:audio")){
                  aBuf=Buffer.from(rAst.url.replace(/^data:audio\\/[^;]+;base64,/,""),"base64");
                }
              }
            }catch(retryErr){
              console.warn("[ElevenLabs Retry Notice]",retryErr.message||retryErr);
            }
          }
        }

        // 4. Đồng bộ tốc độ khẩu hình & Ghép âm thanh khớp hoàn hảo với video Veo3
        if(aBuf && aBuf.length>0){
          this.queue.updateJobProgress(e.id,95,"Đang đồng bộ tốc độ & lồng tiếng ("+vName+")...");
          const randHex=nodeCrypto.randomBytes(6).toString("hex");
          const tAudio=nodePath.join(this.assets.filesDir,"temp_voice_"+randHex+".mp3");
          const tVoiced=nodePath.join(this.assets.filesDir,"temp_voiced_"+randHex+".mp4");
          nodeFs.writeFileSync(tAudio,aBuf);
          try{
            let ttsDuration=vidDuration;
            try{
              const aInfo=await bo(fBin,tAudio,t);
              if(aInfo && Number.isFinite(aInfo.duration) && aInfo.duration>0){
                ttsDuration=aInfo.duration;
              }
            }catch(_){}

            // Căn chỉnh tốc độ nói sao cho âm thanh trải đều video, kết thúc êm ái trước video 0.3s
            const targetDuration=Math.max(1.0,vidDuration-0.35);
            const tempoRatio=ttsDuration/targetDuration;
            const clampedTempo=Math.max(0.80,Math.min(1.35,tempoRatio));

            const ffmpegArgs=[
              "-y",
              "-i",vidAsset.localPath,
              "-i",tAudio
            ];

            if(Math.abs(clampedTempo-1.0)>=0.03){
              ffmpegArgs.push("-filter_complex","[1:a]atempo="+clampedTempo.toFixed(3)+",aresample=48000,aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo[aout]");
              ffmpegArgs.push("-map","0:v:0","-map","[aout]");
            }else{
              ffmpegArgs.push("-map","0:v:0","-map","1:a:0");
            }

            ffmpegArgs.push("-c:v","copy","-c:a","aac","-b:a","192k","-shortest","-movflags","+faststart",tVoiced);

            await fr(fBin,ffmpegArgs,120000,t);
            if(nodeFs.existsSync(tVoiced) && nodeFs.statSync(tVoiced).size>1000){
              nodeFs.copyFileSync(tVoiced,vidAsset.localPath);
              const fSize=nodeFs.statSync(vidAsset.localPath).size;
              vidAsset.bytes=fSize;
              if(this.assets?.state?.assets){
                const curAst=this.assets.state.assets.find(x=>x.id===vidAsset.assetId||x.localPath===vidAsset.localPath);
                if(curAst){
                  curAst.bytes=fSize;
                  try{await this.assets.store?.save(this.assets.state);this.assets.emit();}catch(_){}
                }
              }
              console.log("[ElevenLabs Voiceover] Lồng tiếng thành công 100%! Voice:",vName,"| Thời lượng:",vidDuration,"s");
            }
          }catch(mErr){
            console.error("[ElevenLabs Voiceover Merge Error]",mErr);
          }finally{
            try{if(nodeFs.existsSync(tVoiced)) nodeFs.unlinkSync(tVoiced);}catch(_){}
            try{if(nodeFs.existsSync(tAudio)) nodeFs.unlinkSync(tAudio);}catch(_){}
          }
        }else{
          console.warn("[ElevenLabs Voiceover] Audio buffer was empty for voice:",vId);
        }
      }catch(tErr){
        console.error("[ElevenLabs Voiceover Pipeline Error]",tErr);
      }
    }
  }`;

    code = code.substring(0, hookStart) + upgradedPipelineCode + '\n  ' + code.substring(hookEnd);
    console.log('  ✓ Đã nâng cấp Voiceover Pipeline chuẩn ElevenLabs');
  }

  fs.writeFileSync(mainPath, code, 'utf8');
}

// ============================================================================
// 3. PATCH VIDEO STUDIO UI (app/out/renderer/assets/VideoStudio-BZY_1pM8.js)
// ============================================================================
function patchVideoStudio(vsPath) {
  if (!fs.existsSync(vsPath)) return;
  console.log('\n[*] Đang vá VideoStudio UI:', vsPath);
  let code = fs.readFileSync(vsPath, 'utf8');

  // 3.1 Make sure default voice options include em gala xinh (tQ4MEZFJOzsahSEEZtHK)
  const oldOptionSnippet = 'e.jsx("option",{value:"aN7cv9yXNrfIR87bDmyD",children:"Ninh Đôn (Tiếng Việt - Nam Trầm ấm, truyền cảm)"})';
  const newOptionSnippet = 'e.jsx("option",{value:"tQ4MEZFJOzsahSEEZtHK",children:"★ em gais xinh (Tiếng Việt - Nữ trẻ trung, tự nhiên)"}),e.jsx("option",{value:"aN7cv9yXNrfIR87bDmyD",children:"Ninh Đôn (Tiếng Việt - Nam Trầm ấm, truyền cảm)"})';

  if (code.includes(oldOptionSnippet) && !code.includes('value:"tQ4MEZFJOzsahSEEZtHK"')) {
    code = code.replaceAll(oldOptionSnippet, newOptionSnippet);
    console.log('  ✓ Đã thêm giọng em gais xinh vào danh sách mặc định');
  }

  // 3.2 Ensure default model is eleven_multilingual_v2 or eleven_v3
  // Normalize IQXM092JC4uN1BHfZZhX in savedVoices / selection to tQ4MEZFJOzsahSEEZtHK
  const idFixPattern = /IQXM092JC4uN1BHfZZhX/g;
  if (idFixPattern.test(code)) {
    code = code.replace(idFixPattern, 'tQ4MEZFJOzsahSEEZtHK');
    console.log('  ✓ Đã chuẩn hóa ID giọng sang tQ4MEZFJOzsahSEEZtHK');
  }

  // 3.3 Ensure job creation payload carries modelId and voiceId properly
  const ttsPayloadPattern = /tts:f\.tts\?\.enabled\?\{enabled:!0,voiceId:\(f\.tts\.voiceId\|\|""\)\.trim\(\)\|\|"aN7cv9yXNrfIR87bDmyD"/g;
  const ttsPayloadReplacement = `tts:f.tts?.enabled?{enabled:!0,voiceId:(f.tts.voiceId||"").trim()||"tQ4MEZFJOzsahSEEZtHK"`;
  code = code.replace(ttsPayloadPattern, ttsPayloadReplacement);

  fs.writeFileSync(vsPath, code, 'utf8');
}

// Run patches
for (const root of targetRoots) {
  patchMain(path.join(root, 'out/main/index.js'));
  patchVideoStudio(path.join(root, 'out/renderer/assets/VideoStudio-BZY_1pM8.js'));
}

// Validate JS syntax
console.log('\n--- Kiểm tra cú pháp sau khi vá ---');
targetRoots.forEach(root => {
  const mPath = path.join(root, 'out/main/index.js');
  if (fs.existsSync(mPath)) {
    try {
      execSync(`node --check "${mPath}"`, { stdio: 'pipe' });
      console.log('  ✅ Cú pháp out/main/index.js hợp lệ:', root);
    } catch(err) {
      console.error('  ❌ Cú pháp lỗi:', mPath, err.message);
      process.exit(1);
    }
  }
});

console.log('\n🎉 ĐÃ CẬP NHẬT HOÀN TẤT ELEVENLABS NATIVE DUBBING PIPELINE!');
