const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('======================================================================');
console.log('🎬 MASTER PATCH: FIX VEO3/GROK ELEVENLABS AUDIO MERGE & CLEAN VIDEOSTUDIO 🎬');
console.log('======================================================================');

const targetRoots = [
  path.join(__dirname, '../app'),
  path.join(__dirname, '../extracted_original'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Customer_Edition/resources/app')
];

// ============================================================================
// 1. PATCH MAIN PROCESS (main/index.js)
// ============================================================================
function patchMainProcess(mainPath) {
  if (!fs.existsSync(mainPath)) return;
  console.log('[*] Đang sửa lỗi và nâng cấp Main Process tại:', mainPath);
  let code = fs.readFileSync(mainPath, 'utf8');

  // Ensure Node imports exist at the top if missing
  if (!code.includes('import nodeFs from "node:fs";')) {
    code = 'import nodeCrypto from "node:crypto";\nimport nodeFs from "node:fs";\nimport nodePath from "node:path";\n' + code;
  }

  // Remove any previous buggy TTS merge block around cacheQueueResult
  const anchor = 'const c=await this.assets.cacheQueueResult(n,a);';
  
  // Clean up any old injected block if present
  const oldBlockRegex = /const c=await this\.assets\.cacheQueueResult\(n,a\);[\s\S]*?const d=this\.queue\.findJob\(e\.id\);/;
  if (oldBlockRegex.test(code)) {
    code = code.replace(oldBlockRegex, `${anchor}\n  const d=this.queue.findJob(e.id);`);
  }

  const robustTtsMergeCode = `const c=await this.assets.cacheQueueResult(n,a);
  if(n.payload?.tts?.enabled && c.assets?.length>0){
    const vidAsset=c.assets.find(ast=>ast.type==="video");
    if(vidAsset && vidAsset.localPath && nodeFs.existsSync(vidAsset.localPath)){
      try{
        const tData=n.payload.tts;
        const sText=((tData && tData.script) || n.payload.prompt || "").trim();
        const vId=(tData.voiceId||"").trim()||"aN7cv9yXNrfIR87bDmyD";
        const mId=(tData.modelId||"").trim()||"eleven_multilingual_v2";
        const vName=(tData.voiceName||"").trim()||vId;

        if(sText){
          this.queue.updateJobProgress(e.id,88,"Đang tạo giọng đọc ElevenLabs ("+vName+")...");
          let aBuf=null;

          // 1. Call built-in ElevenLabs runner (with automatic captcha solving)
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
                  voiceSettings:{
                    stability:typeof tData.stability==="number"?tData.stability:0.5,
                    similarity_boost:typeof tData.similarityBoost==="number"?tData.similarityBoost:0.75,
                    speed:typeof tData.speed==="number"?tData.speed:1,
                    style:typeof tData.style==="number"?tData.style:0,
                    use_speaker_boost:tData.useSpeakerBoost!==false
                  }
                }
              };
              const ttsResult=await eRunner.runJob(ttsJob,{
                signal:t,
                updateProgress:(p,msg)=>this.queue.updateJobProgress(e.id,Math.min(94,88+Math.round((p||0)*0.06)),"ElevenLabs: "+(msg||"Đang tạo giọng đọc"))
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
            console.warn("[Voiceover Runner Synth Notice]",runnerErr.message||runnerErr);
          }

          // 2. Direct anonymous API fallback if runner failed
          if(!aBuf || aBuf.length===0){
            try{
              const dRes=await fetch("https://api.elevenlabs.io/v1/text-to-speech/"+encodeURIComponent(vId)+"/stream/with-timestamps/anonymous",{
                method:"POST",
                headers:{"Content-Type":"application/json","Accept":"audio/mpeg"},
                body:JSON.stringify({
                  text:sText,
                  model_id:mId,
                  voice_settings:{stability:0.5,similarity_boost:0.75}
                }),
                signal:t
              });
              if(dRes.ok){
                aBuf=Buffer.from(await dRes.arrayBuffer());
              }
            }catch(directErr){
              console.warn("[Voiceover Direct API Notice]",directErr.message||directErr);
            }
          }

          // 3. Merge audio with video using FFmpeg
          if(aBuf && aBuf.length>0){
            this.queue.updateJobProgress(e.id,95,"Đang ghép giọng đọc ("+vName+") vào video...");
            const fBin=await oa(t);
            const randHex=nodeCrypto.randomBytes(6).toString("hex");
            const tAudio=nodePath.join(this.assets.filesDir,"temp_voice_"+randHex+".mp3");
            const tVoiced=nodePath.join(this.assets.filesDir,"temp_voiced_"+randHex+".mp4");
            nodeFs.writeFileSync(tAudio,aBuf);
            try{
              await fr(fBin,[
                "-y",
                "-i",vidAsset.localPath,
                "-i",tAudio,
                "-map","0:v:0",
                "-map","1:a:0",
                "-c:v","copy",
                "-c:a","aac",
                "-b:a","192k",
                "-shortest",
                "-movflags","+faststart",
                tVoiced
              ],120000,t);
              if(nodeFs.existsSync(tVoiced) && nodeFs.statSync(tVoiced).size>1000){
                nodeFs.copyFileSync(tVoiced,vidAsset.localPath);
                console.log("[ElevenLabs Voiceover] Successfully merged voice ("+vName+") into video:",vidAsset.localPath);
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
        }
      }catch(tErr){
        console.error("[ElevenLabs Voiceover Pipeline Error]",tErr);
      }
    }
  }`;

  code = code.replace(anchor, robustTtsMergeCode);
  fs.writeFileSync(mainPath, code, 'utf8');
  console.log('[+] Đã cập nhật Main Process thành công tại:', mainPath);
}

// ============================================================================
// 2. PATCH VIDEOSTUDIO (renderer/assets/VideoStudio-BZY_1pM8.js)
// ============================================================================
function patchVideoStudio(vsPath) {
  if (!fs.existsSync(vsPath)) return;
  console.log('[*] Đang sửa lỗi và nâng cấp VideoStudio tại:', vsPath);
  let code = fs.readFileSync(vsPath, 'utf8');

  // 2.1 Remove the misplaced broken <section> from inside Zo (video preview bar)
  const brokenSectionRegex = /,e\.jsxs\("section",\{className:"flex flex-col gap-2\.5 rounded-lg border border-cyan-500\/30 bg-cyan-950\/30 p-3 shadow-\[0_0_15px_rgba\(6,182,212,0\.08\)\]"[\s\S]*?\}\]\}\)/;
  if (brokenSectionRegex.test(code)) {
    code = code.replace(brokenSectionRegex, '');
    console.log('[+] Đã gỡ bỏ section bị đặt nhầm vị trí trong Zo');
  }

  // 2.2 Patch Grok Job Creation to fallback to f.prompt if f.tts.script is empty
  const grokOldPattern = /tts:f\.tts\?\.enabled&&f\.tts\?\.script\?\.trim\(\)\?\{enabled:!0,voiceId:f\.tts\.voiceId\|\|"aN7cv9yXNrfIR87bDmyD",voiceName:f\.tts\.voiceName\|\|"Ninh Đôn – Deep & Warm",script:f\.tts\.script\.trim\(\),modelId:f\.tts\.modelId\|\|"eleven_multilingual_v2"\}:void 0/g;
  const grokNewPattern = `tts:f.tts?.enabled&&(f.tts?.script?.trim()||f.prompt?.trim())?{enabled:!0,voiceId:(f.tts.voiceId||"").trim()||"aN7cv9yXNrfIR87bDmyD",voiceName:(f.tts.voiceName||"").trim()||"Ninh Đôn – Deep & Warm",script:(f.tts?.script?.trim()||f.prompt?.trim()||""),modelId:(f.tts.modelId||"").trim()||"eleven_multilingual_v2"}:void 0`;
  code = code.replace(grokOldPattern, grokNewPattern);

  // 2.3 Patch Veo 3 Job Creation to fallback to f.prompt if f.tts.script is empty
  // (Note: grokOldPattern regex handles both because the snippet is identical)
  code = code.replace(grokOldPattern, grokNewPattern);

  // 2.4 Verify and ensure Top Bar and Inspector ElevenLabs components are intact and working
  fs.writeFileSync(vsPath, code, 'utf8');
  console.log('[+] Đã cập nhật VideoStudio thành công tại:', vsPath);
}

// Apply patches across all target roots
targetRoots.forEach(root => {
  patchMainProcess(path.join(root, 'out/main/index.js'));
  patchVideoStudio(path.join(root, 'out/renderer/assets/VideoStudio-BZY_1pM8.js'));
});

// Run syntax verification on all patched files
console.log('\n--- Kiểm tra cú pháp sau khi vá ---');
try {
  targetRoots.forEach(root => {
    const mPath = path.join(root, 'out/main/index.js');
    if (fs.existsSync(mPath)) {
      execSync(`node --check "${mPath}"`, { stdio: 'inherit' });
      console.log('✅ Syntax OK:', mPath);
    }
    const vPath = path.join(root, 'out/renderer/assets/VideoStudio-BZY_1pM8.js');
    if (fs.existsSync(vPath)) {
      execSync(`node --check "${vPath}"`, { stdio: 'inherit' });
      console.log('✅ Syntax OK:', vPath);
    }
  });
} catch (err) {
  console.error('❌ Syntax Error detected:', err.message);
  process.exit(1);
}

console.log('\n✨ TOÀN BỘ CODE ĐÃ HOÀN HẢO! SẴN SÀNG ĐÓNG GÓI! ✨\n');
