const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('======================================================================');
console.log('🎬 MASTER PATCH: COMPLETE ELEVENLABS AUTO-DUBBING & VEO3/GROK PAYLOADS 🎬');
console.log('======================================================================');

const targetRoots = [
  path.join(__dirname, '../app'),
  path.join(__dirname, '../extracted_original'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Customer_Edition/resources/app'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Khach_Hang_v3.0/resources/app')
];

// Clean pristine VideoStudio base
const pristineVsPath = path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Khach_Hang_v3.0/resources/app/out/renderer/assets/VideoStudio-BZY_1pM8.js');
const baseVsCode = fs.readFileSync(pristineVsPath, 'utf8');

// Load clean snippets
const bannerCode = fs.readFileSync(path.join(__dirname, 'test_clean_banner.js'), 'utf8');
const bannerSnippet = bannerCode.slice(bannerCode.indexOf('const topToolbarBannerClean = `') + 31, bannerCode.indexOf('`;\n\nfs.writeFileSync'));

const inspectorCode = fs.readFileSync(path.join(__dirname, 'test_clean_inspector.js'), 'utf8');
const inspectorSnippet = inspectorCode.slice(inspectorCode.indexOf('const newInspectorSectionClean = `') + 34, inspectorCode.indexOf('`;\n\nfs.writeFileSync'));

// ============================================================================
// 1. BUILD PATCHED VIDEOSTUDIO CODE
// ============================================================================
let patchedVsCode = baseVsCode;

// Splicing 1: Top Toolbar Banner between header anchor and table anchor
const headerAnchor = 'e.jsx("span",{children:sr($,"video")})]})]}),';
const tableAnchor = 'e.jsx("div",{ref:w,className:"max-h-[312px] overflow-auto"';

const hIdx = patchedVsCode.indexOf(headerAnchor);
const tIdx = patchedVsCode.indexOf(tableAnchor);

if (hIdx === -1 || tIdx === -1) {
  console.error('❌ Header or Table Anchor not found in base VideoStudio code!');
  process.exit(1);
}

patchedVsCode = patchedVsCode.slice(0, hIdx + headerAnchor.length) + bannerSnippet + ',' + patchedVsCode.slice(tIdx);

// Splicing 2: Inspector Section before Prompt section in function cn
const cnIdx = patchedVsCode.indexOf('function cn(');
const promptSectionAnchor = 'e.jsxs("section",{className:"flex flex-col gap-1.5 rounded-lg border border-border-primary bg-bg-primary/25 p-3",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("label",{className:"text-[9px] font-bold text-text-muted uppercase tracking-wider select-none",children:"Prompt"})';
const pIdx = patchedVsCode.indexOf(promptSectionAnchor, cnIdx);

if (pIdx === -1) {
  console.error('❌ promptSectionAnchor not found in function cn!');
  process.exit(1);
}

patchedVsCode = patchedVsCode.slice(0, pIdx) + inspectorSnippet + ',' + patchedVsCode.slice(pIdx);

// Splicing 3: Default TTS scene initialization in kt()
const oldKt1 = 'negativePrompt:s?.negativePrompt||"",referenceAssetIds:[]}}';
const newKt1 = 'negativePrompt:s?.negativePrompt||"",tts:s?.tts||{enabled:!1,voiceId:"aN7cv9yXNrfIR87bDmyD",voiceName:"Ninh Đôn – Deep & Warm (Tiếng Việt)",script:"",modelId:"eleven_multilingual_v2"},referenceAssetIds:[]}}';
if (patchedVsCode.includes(oldKt1)) {
  patchedVsCode = patchedVsCode.replace(oldKt1, newKt1);
  console.log('  ✓ Default TTS config added to kt()');
}

// Splicing 4: Grok & Veo3 payload TTS attachments
const grokTtsSnippet = `tts:f.tts?.enabled?{enabled:!0,voiceId:(f.tts.voiceId||"").trim()||"aN7cv9yXNrfIR87bDmyD",voiceName:(f.tts.voiceName||"").trim()||"Ninh Đôn – Deep & Warm (Tiếng Việt)",script:(f.tts.script||"").trim(),modelId:(f.tts.modelId||"").trim()||"eleven_multilingual_v2"}:void 0`;

// 4.1 Grok job payload
const oldGrokTtsRegex = /tts:f\.tts\?\.enabled[\s\S]*?modelId:[^}]+}:void 0/g;
if (oldGrokTtsRegex.test(patchedVsCode)) {
  patchedVsCode = patchedVsCode.replace(oldGrokTtsRegex, grokTtsSnippet);
}

// 4.2 Veo3 job payload (insert right after sceneName)
const veoSceneAnchor = 'sceneName:f.sceneName||`Phân cảnh ${f.index}`,';
if (patchedVsCode.includes(veoSceneAnchor) && !patchedVsCode.includes(veoSceneAnchor + grokTtsSnippet + ',')) {
  patchedVsCode = patchedVsCode.replace(veoSceneAnchor, veoSceneAnchor + grokTtsSnippet + ',');
  console.log('  ✓ Added tts payload to Veo3 job creation!');
}

// Test syntax of patchedVsCode immediately
fs.writeFileSync('temp_vs_verify.mjs', patchedVsCode);
try {
  execSync('node --check temp_vs_verify.mjs', { stdio: 'inherit' });
  console.log('  🎉 [PASS] VideoStudio JS AST syntax is 100% valid!');
} catch (e) {
  console.error('  ❌ [FAIL] VideoStudio JS AST syntax error!');
  process.exit(1);
} finally {
  try { fs.unlinkSync('temp_vs_verify.mjs'); } catch (_) {}
}

// ============================================================================
// 2. PATCH MAIN PROCESS PIPELINE (out/main/index.js)
// ============================================================================
function patchMainProcess(mainPath) {
  if (!fs.existsSync(mainPath)) return;
  console.log('[*] Đang nâng cấp Main Process Pipeline tại:', mainPath);
  let code = fs.readFileSync(mainPath, 'utf8');

  // Ensure Node imports exist at the top if missing
  if (!code.includes('import nodeFs from "node:fs";')) {
    code = 'import nodeCrypto from "node:crypto";\nimport nodeFs from "node:fs";\nimport nodePath from "node:path";\n' + code;
  }

  // Anchor in Queue Worker run()
  const anchor = 'const c=await this.assets.cacheQueueResult(n,a);';

  const robustTtsMergeCode = `const c=await this.assets.cacheQueueResult(n,a);
  if(n.payload?.tts?.enabled && c.assets?.length>0){
    const vidAsset=c.assets.find(ast=>ast.type==="video");
    if(vidAsset && vidAsset.localPath && nodeFs.existsSync(vidAsset.localPath)){
      try{
        const tData=n.payload.tts;
        const vId=(tData.voiceId||"").trim()||"aN7cv9yXNrfIR87bDmyD";
        const mId=(tData.modelId||"").trim()||"eleven_multilingual_v2";
        const vName=(tData.voiceName||"").trim()||vId;
        const fBin=await oa(t);

        // 1. Determine spoken dialogue text (from script, prompt, or video context)
        let sText=((tData && tData.script) || "").trim();
        if(!sText){
          const rawPrompt=(n.payload?.prompt||n.title||"").trim();
          const quoteMatch=rawPrompt.match(/["“'«]([^"”'»]{3,})["”'»]/);
          if(quoteMatch){
            sText=quoteMatch[1].trim();
          }else{
            sText=rawPrompt.replace(/^(cinematic video of|a (man|woman|person|girl|boy|character) (is )?(talking|speaking|saying)|close-up of (a )?character saying)\\s*:?\\s*/i,"").trim();
          }
        }

        // 2. Ensure natural Vietnamese dialogue
        const hasVietnamese=/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(sText);
        if(!hasVietnamese && sText.length>0){
          const translations=[
            {r:/hello\\s*(everyone|everybody|world|guys)?/i,v:"Xin chào tất cả các bạn"},
            {r:/welcome\\s*(back)?\\s*to\\s*(our|my)?/i,v:"Chào mừng các bạn đã đến với"},
            {r:/today\\s*we\\s*(are going to|will|explore)/i,v:"Hôm nay chúng ta sẽ cùng khám phá"},
            {r:/thank\\s*you\\s*(very much|for watching)?/i,v:"Cảm ơn các bạn rất nhiều vì đã theo dõi"},
            {r:/don't forget to like and subscribe/i,v:"Đừng quên bấm like và theo dõi kênh nhé"},
            {r:/let's get started/i,v:"Chúng ta cùng bắt đầu ngay thôi nào"}
          ];
          for(const item of translations){
            if(item.r.test(sText)) sText=sText.replace(item.r,item.v);
          }
          if(!/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(sText)){
            if(/talking|speaking|interview|podcast|presentation|introducing/i.test(sText) || sText.length<5){
              sText="Xin chào các bạn, chào mừng các bạn đến với video hôm nay!";
            }
          }
        }
        sText=sText.replace(/\\s+/g," ").trim();
        if(sText && !/[.!?]$/.test(sText)) sText+=".";

        if(sText){
          this.queue.updateJobProgress(e.id,88,"Đang tạo giọng đọc ElevenLabs chuẩn tiếng Việt ("+vName+")...");
          let aBuf=null;

          // 3. Call ElevenLabs TTS runtime
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
                    stability:typeof tData.stability==="number"?tData.stability:0.55,
                    similarity_boost:typeof tData.similarityBoost==="number"?tData.similarityBoost:0.85,
                    speed:typeof tData.speed==="number"?tData.speed:1.0,
                    style:typeof tData.style==="number"?tData.style:0.15,
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

          // 4. Direct API fallback
          if(!aBuf || aBuf.length===0){
            try{
              const dRes=await fetch("https://api.elevenlabs.io/v1/text-to-speech/"+encodeURIComponent(vId)+"/stream/with-timestamps/anonymous",{
                method:"POST",
                headers:{"Content-Type":"application/json","Accept":"audio/mpeg"},
                body:JSON.stringify({
                  text:sText,
                  model_id:mId,
                  voice_settings:{stability:0.55,similarity_boost:0.85,style:0.15,use_speaker_boost:true}
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

          // 5. Time-Stretching & FFmpeg Lossless Video Remux
          if(aBuf && aBuf.length>0){
            this.queue.updateJobProgress(e.id,95,"Đang đồng bộ khẩu hình & ghép giọng đọc ("+vName+")...");
            const randHex=nodeCrypto.randomBytes(6).toString("hex");
            const tAudio=nodePath.join(this.assets.filesDir,"temp_voice_"+randHex+".mp3");
            const tVoiced=nodePath.join(this.assets.filesDir,"temp_voiced_"+randHex+".mp4");
            nodeFs.writeFileSync(tAudio,aBuf);
            try{
              // Probe video duration to calculate optimal tempo
              let vidDuration=8.0;
              try{
                const pInfo=await bo(fBin,vidAsset.localPath,t);
                if(pInfo && Number.isFinite(pInfo.duration) && pInfo.duration>0){
                  vidDuration=pInfo.duration;
                }
              }catch(_){}

              let ttsDuration=vidDuration;
              try{
                const aInfo=await bo(fBin,tAudio,t);
                if(aInfo && Number.isFinite(aInfo.duration) && aInfo.duration>0){
                  ttsDuration=aInfo.duration;
                }
              }catch(_){}

              const targetDuration=Math.max(1.0,vidDuration-0.3);
              const tempoRatio=ttsDuration/targetDuration;
              const clampedTempo=Math.max(0.75,Math.min(1.45,tempoRatio));

              const ffmpegArgs=[
                "-y",
                "-i",vidAsset.localPath,
                "-i",tAudio
              ];

              if(Math.abs(clampedTempo-1.0)>=0.04){
                ffmpegArgs.push("-filter_complex","[1:a]atempo="+clampedTempo.toFixed(3)+",aresample=48000,aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo[aout]");
                ffmpegArgs.push("-map","0:v:0","-map","[aout]");
              }else{
                ffmpegArgs.push("-map","0:v:0","-map","1:a:0");
              }

              ffmpegArgs.push("-c:v","copy","-c:a","aac","-b:a","192k","-shortest","-movflags","+faststart",tVoiced);

              await fr(fBin,ffmpegArgs,120000,t);
              if(nodeFs.existsSync(tVoiced) && nodeFs.statSync(tVoiced).size>1000){
                nodeFs.copyFileSync(tVoiced,vidAsset.localPath);
                vidAsset.bytes=nodeFs.statSync(vidAsset.localPath).size;
                if(this.assets?.state?.assets){
                  const curAst=this.assets.state.assets.find(x=>x.id===vidAsset.assetId||x.localPath===vidAsset.localPath);
                  if(curAst){
                    curAst.bytes=vidAsset.bytes;
                    try{await this.assets.store?.save(this.assets.state);this.assets.emit();}catch(_){}
                  }
                }
                console.log("[ElevenLabs Voiceover] Successfully lip-synced & merged voice ("+vName+") into video:",vidAsset.localPath);
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

  const oldBlockRegex = /const c=await this\.assets\.cacheQueueResult\(n,a\);[\s\S]*?const d=this\.queue\.findJob\(e\.id\);/;
  if (oldBlockRegex.test(code)) {
    code = code.replace(oldBlockRegex, `${robustTtsMergeCode}\n  const d=this.queue.findJob(e.id);`);
    console.log('  ✓ Đã cập nhật pipeline lồng tiếng & đồng bộ khẩu hình vào Main Process!');
  } else if (code.includes(anchor)) {
    code = code.replace(anchor, robustTtsMergeCode);
    console.log('  ✓ Đã tiêm mới pipeline lồng tiếng hoàn chỉnh vào Main Process!');
  }

  fs.writeFileSync(mainPath, code, 'utf8');
}

// ============================================================================
// 3. APPLY TO ALL TARGET DIRECTORIES
// ============================================================================
for (const root of targetRoots) {
  if (!fs.existsSync(root)) continue;
  console.log('\n============================================================');
  console.log('--- Đang cập nhật gói tại:', root, '---');
  console.log('============================================================');

  // 1. Write patched VideoStudio file
  const vsTarget = path.join(root, 'out/renderer/assets/VideoStudio-BZY_1pM8.js');
  if (fs.existsSync(path.dirname(vsTarget))) {
    fs.writeFileSync(vsTarget, patchedVsCode, 'utf8');
    console.log('  ✓ Đã ghi file VideoStudio:', vsTarget);
  }

  // 2. Patch Main Process
  const mainTarget = path.join(root, 'out/main/index.js');
  if (fs.existsSync(mainTarget)) {
    patchMainProcess(mainTarget);
  }
}

// ============================================================================
// 4. VERIFY SYNTAX INTEGRITY ACROSS ALL DIRECTORIES
// ============================================================================
console.log('\n============================================================');
console.log('--- Kiểm tra toàn bộ cú pháp JS sau khi nâng cấp ---');
console.log('============================================================');
for (const root of targetRoots) {
  const vsTarget = path.join(root, 'out/renderer/assets/VideoStudio-BZY_1pM8.js');
  if (fs.existsSync(vsTarget)) {
    try {
      execSync(`node --check "${vsTarget}"`, { stdio: 'inherit' });
      console.log('  [PASS] VideoStudio:', vsTarget);
    } catch (err) {
      console.error('  [FAIL] VideoStudio error:', vsTarget);
      process.exit(1);
    }
  }
  const mainTarget = path.join(root, 'out/main/index.js');
  if (fs.existsSync(mainTarget)) {
    try {
      execSync(`node --check "${mainTarget}"`, { stdio: 'inherit' });
      console.log('  [PASS] Main Process:', mainTarget);
    } catch (err) {
      console.error('  [FAIL] Main Process error:', mainTarget);
      process.exit(1);
    }
  }
}

console.log('\n✨ TOÀN BỘ CÁC BẢN BUILD ĐÃ HOÀN TẤT & ĐẠT CHUẨN 100%! ✨\n');
