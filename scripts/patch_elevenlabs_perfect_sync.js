const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('======================================================================');
console.log('🎙️ NÂNG CẤP HOÀN CHỈNH ELEVENLABS: NHẬN DIỆN MÃ VOICE & LỒNG TIẾNG VIDEO 🎙️');
console.log('======================================================================');

const targetRoots = [
  path.join(__dirname, '../app'),
  path.join(__dirname, '../extracted_original'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Customer_Edition/resources/app')
];

// ============================================================================
// 1. PATCH MAIN PROCESS (app/out/main/index.js)
// ============================================================================
function patchMainProcess(mainPath) {
  if (!fs.existsSync(mainPath)) return;
  console.log('[*] Đang nâng cấp Main Process Pipeline tại:', mainPath);
  let code = fs.readFileSync(mainPath, 'utf8');

  // Inject ElevenLabs Runner + FFmpeg voiceover merging right after cacheQueueResult
  const anchor = 'const c=await this.assets.cacheQueueResult(n,a);';
  
  const robustTtsMergeCode = `const c=await this.assets.cacheQueueResult(n,a);
  if(n.payload?.tts?.enabled && n.payload?.tts?.script?.trim() && c.assets?.length>0){
    const vidAsset=c.assets.find(ast=>ast.type==="video");
    if(vidAsset && vidAsset.localPath && ye(vidAsset.localPath)){
      try{
        const tData=n.payload.tts;
        const vId=(tData.voiceId||"").trim()||"aN7cv9yXNrfIR87bDmyD";
        const mId=(tData.modelId||"").trim()||"eleven_multilingual_v2";
        const vName=(tData.voiceName||"").trim()||vId;
        const sText=tData.script.trim();
        this.queue.updateJobProgress(e.id,90,"Đang tạo giọng đọc ElevenLabs ("+vName+")...");
        let aBuf=null;

        // 1. Try built-in ElevenLabs runner with captcha solver
        try{
          const eRunner=this.runtimes.get("elevenlabs","TTS");
          if(eRunner){
            const ttsJob={
              id:"voiceover-"+e.id+"-"+Date.now(),
              type:"TTS",
              providerId:"elevenlabs",
              title:sText.slice(0,80),
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
              updateProgress:(p,msg)=>this.queue.updateJobProgress(e.id,Math.min(95,90+Math.round((p||0)*0.05)),"ElevenLabs: "+(msg||"Đang xử lý"))
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
          console.warn("[Voiceover Runner Synth Notice]",runnerErr.message);
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
            console.warn("[Voiceover Direct API Notice]",directErr.message);
          }
        }

        // 3. Merge audio with video using FFmpeg
        if(aBuf && aBuf.length>0){
          this.queue.updateJobProgress(e.id,95,"Đang ghép giọng đọc ("+vName+") vào video...");
          const fBin=await oa(t);
          const tAudio=N(this.assets.filesDir,"temp_voice_"+M()+".mp3");
          const tVoiced=N(this.assets.filesDir,"temp_voiced_"+M()+".mp4");
          await ut(tAudio,aBuf);
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
            ],Pt,t);
            if(ye(tVoiced)){
              await Zc(tVoiced,vidAsset.localPath);
              console.log("[ElevenLabs Voiceover] Successfully merged voice ("+vName+") into video:",vidAsset.localPath);
            }
          }catch(mErr){
            console.error("[ElevenLabs Voiceover Merge Error]",mErr);
          }finally{
            try{await We(tVoiced)}catch(_){}
            try{await We(tAudio)}catch(_){}
          }
        }else{
          console.warn("[ElevenLabs Voiceover] Audio buffer was empty for voice:",vId);
        }
      }catch(tErr){
        console.error("[ElevenLabs Voiceover Pipeline Error]",tErr);
      }
    }
  }`;

  // Check if we need to replace previous ttsMergeCode or inject fresh
  if (code.includes('if(n.payload?.tts?.enabled&&n.payload?.tts?.script?.trim()&&c.assets?.length>0){')) {
    // Find where the old block starts and where const d=this.queue.findJob(e.id); is
    const oldBlockStart = code.indexOf('if(n.payload?.tts?.enabled&&n.payload?.tts?.script?.trim()&&c.assets?.length>0){');
    const oldBlockEnd = code.indexOf('const d=this.queue.findJob(e.id);', oldBlockStart);
    if (oldBlockStart !== -1 && oldBlockEnd !== -1) {
      code = code.slice(0, oldBlockStart) + robustTtsMergeCode.replace('const c=await this.assets.cacheQueueResult(n,a);', '').trim() + '\n  ' + code.slice(oldBlockEnd);
      console.log('  ✓ Đã cập nhật pipeline lồng tiếng hoàn chỉnh vào Main Process!');
    }
  } else if (code.includes(anchor)) {
    code = code.replace(anchor, robustTtsMergeCode);
    console.log('  ✓ Đã tiêm mới pipeline lồng tiếng hoàn chỉnh vào Main Process!');
  }

  fs.writeFileSync(mainPath, code, 'utf8');
}

// ============================================================================
// 2. PATCH VIDEO STUDIO RENDERER (app/out/renderer/assets/VideoStudio-BZY_1pM8.js)
// ============================================================================
function patchVideoStudio(vsPath) {
  if (!fs.existsSync(vsPath)) return;
  console.log('[*] Đang nâng cấp UI VideoStudio tại:', vsPath);
  let code = fs.readFileSync(vsPath, 'utf8');

  // 2.1 Default scene tts initialization in kt()
  const oldKt1 = 'negativePrompt:s?.negativePrompt||"",referenceAssetIds:[]}}';
  const newKt1 = 'negativePrompt:s?.negativePrompt||"",tts:s?.tts||{enabled:!1,voiceId:"aN7cv9yXNrfIR87bDmyD",voiceName:"Ninh Đôn – Deep & Warm",script:"",modelId:"eleven_multilingual_v2"},referenceAssetIds:[]}}';
  if (code.includes(oldKt1)) {
    code = code.replace(oldKt1, newKt1);
    console.log('  ✓ Đã thêm tts config mặc định vào kt()');
  }

  // 2.2 Grok Video payload tts injection
  const oldGrokPayload = 'model:"grok-imagine-video",tts:f.tts?.enabled&&f.tts?.script?.trim()?{enabled:!0,voiceId:f.tts.voiceId||"21m00Tcm4TlvDq8ikWAM",voiceName:f.tts.voiceName||"Rachel",script:f.tts.script.trim(),modelId:f.tts.modelId||"eleven_multilingual_v2"}:void 0,outputIndex:';
  const newGrokPayload = 'model:"grok-imagine-video",tts:f.tts?.enabled&&f.tts?.script?.trim()?{enabled:!0,voiceId:f.tts.voiceId||"aN7cv9yXNrfIR87bDmyD",voiceName:f.tts.voiceName||"Ninh Đôn – Deep & Warm",script:f.tts.script.trim(),modelId:f.tts.modelId||"eleven_multilingual_v2"}:void 0,outputIndex:';
  if (code.includes(oldGrokPayload)) {
    code = code.replace(oldGrokPayload, newGrokPayload);
    console.log('  ✓ Đã cập nhật tts payload cho Grok');
  }

  // 2.3 Veo3 Video payload tts injection
  const oldVeoTarget = 'model:f.model,creditCost:Re(f.model,f.duration),creditTotal:Re(f.model,f.duration),';
  const newVeoTarget = 'model:f.model,tts:f.tts?.enabled&&f.tts?.script?.trim()?{enabled:!0,voiceId:f.tts.voiceId||"aN7cv9yXNrfIR87bDmyD",voiceName:f.tts.voiceName||"Ninh Đôn – Deep & Warm",script:f.tts.script.trim(),modelId:f.tts.modelId||"eleven_multilingual_v2"}:void 0,creditCost:Re(f.model,f.duration),creditTotal:Re(f.model,f.duration),';
  if (code.includes(oldVeoTarget) && !code.includes('tts:f.tts?.enabled&&f.tts?.script?.trim()?{enabled:!0,voiceId:f.tts.voiceId||"aN7cv9yXNrfIR87bDmyD",voiceName:f.tts.voiceName||"Ninh Đôn – Deep & Warm"')) {
    code = code.replace(oldVeoTarget, newVeoTarget);
    console.log('  ✓ Đã tích hợp tts payload cho Veo 3 Video!');
  }

  // 2.4 Replace Top Toolbar Banner with interactive voice recognition + auto memory save
  const topToolbarBanner = `e.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-3 border-b border-cyan-500/30 bg-gradient-to-r from-[#0d1627] via-[#130f24] to-[#0d1627] px-4 py-2.5 shadow-lg",children:[
    e.jsxs("div",{className:"flex items-center gap-3",children:[
      e.jsxs("div",{className:"flex items-center gap-2 cursor-pointer select-none",onClick:()=>{if(d){const u=d.tts?.enabled;V(d.id,{tts:{enabled:!u,voiceId:d.tts?.voiceId||"aN7cv9yXNrfIR87bDmyD",voiceName:d.tts?.voiceName||"Ninh Đôn – Deep & Warm",script:d.tts?.script||"",modelId:d.tts?.modelId||"eleven_multilingual_v2"}})}}},children:[
        e.jsx("span",{className:"text-base animate-pulse",children:"🎙️"}),
        e.jsxs("div",{children:[
          e.jsx("span",{className:"text-xs font-bold text-cyan-300 uppercase tracking-wider block",children:"Lồng Tiếng ElevenLabs"}),
          e.jsx("span",{className:"text-[10px] text-text-muted block",children:d?\`Phân cảnh #\${d.index}: \${d.tts?.enabled?("Đang bật: "+(d.tts?.voiceName||"Ninh Đôn – Deep & Warm")):"Chưa bật"}\`:"Tự động tạo giọng đọc và ghép trực tiếp vào video"})
        ]})
      ]}),
      e.jsxs("button",{type:"button",onClick:()=>{if(d){const u=d.tts?.enabled;V(d.id,{tts:{enabled:!u,voiceId:d.tts?.voiceId||"aN7cv9yXNrfIR87bDmyD",voiceName:d.tts?.voiceName||"Ninh Đôn – Deep & Warm",script:d.tts?.script||"",modelId:d.tts?.modelId||"eleven_multilingual_v2"}})}},className:\`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer shadow-sm \${d?.tts?.enabled?"bg-cyan-500 text-black border-cyan-400 font-extrabold shadow-cyan-500/30":"bg-white/10 text-white/70 border-white/20 hover:border-cyan-400 hover:text-white"}\`,children:[
        e.jsx("span",{className:\`w-2 h-2 rounded-full \${d?.tts?.enabled?"bg-black":"bg-text-muted"}\`}),
        d?.tts?.enabled?"ĐANG BẬT":"TẮT"
      ]}),
      e.jsx("button",{type:"button",title:"Áp dụng giọng đọc hiện tại và bật lồng tiếng cho TẤT CẢ các phân cảnh trong bảng",onClick:()=>{
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
        e.jsx("option",{value:"TxGEqnHWrfWFTfGW9XjX",children:"Josh (Nam - Tự tin)"}),
        ...(typeof window!=="undefined"&&window.localStorage?(()=>{
          try{
            const raw=window.localStorage.getItem("aiforge.ttsStudio.savedVoices.v1");
            const sv=raw?JSON.parse(raw):[];
            const defIds=new Set(["aN7cv9yXNrfIR87bDmyD","EcENCamMHdzIoMysqdsv","ipTvfDXAg1zowfF1rv9w","KVzG2JMdZJKi6y7cwERP","21m00Tcm4TlvDq8ikWAM","pNInz6obpgDQGcFmaJgB","ErXwobaYiN019PkySvjV","EXAVITQu4vr4xnSDxMaL","VR6AewLTigWG4xSOukaG","AZnzlk1XvdvUeBnXmlld","MF3mGyEYCl7XYWbV9V6O","TxGEqnHWrfWFTfGW9XjX"]);
            return sv.filter(x=>x&&x.voiceId&&!defIds.has(x.voiceId)).map(x=>e.jsx("option",{value:x.voiceId,children:\`★ \${x.voiceName||x.voiceId}\`},x.voiceId));
          }catch(_){return[];}
        })():[])
      ]}),
      e.jsxs("div",{className:"relative flex items-center shrink-0",children:[
        e.jsx("input",{type:"text",value:d.tts?.voiceId||"",onBlur:async p=>{
          let v=(p.target.value||"").trim().replace(/^.*voices\\//i,"").replace(/^.*share\\//i,"").replace(/\\?.*$/,"").trim();
          if(!v)return;
          if(window.aiforge?.tts?.lookupSharedVoice){
            try{
              const res=await window.aiforge.tts.lookupSharedVoice(v);
              if(res && (res.voiceName||res.name)){
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
                if(res && (res.voiceName||res.name)){
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
              if(res && (res.voiceName||res.name)){
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

  // Locate the header anchor in VideoStudio
  const headerAnchor = 'e.jsx("span",{children:sr($,"video")})]})]}),';
  if (code.includes(headerAnchor)) {
    // If previous banner exists, replace it cleanly
    const prevBannerStart = code.indexOf(headerAnchor);
    const afterAnchor = code.slice(prevBannerStart + headerAnchor.length);
    if (afterAnchor.startsWith('e.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-3 border-b border-cyan-500/30')) {
      const bannerEndIdx = afterAnchor.indexOf(']}),') + 4;
      code = code.slice(0, prevBannerStart + headerAnchor.length) + topToolbarBanner + afterAnchor.slice(bannerEndIdx);
      console.log('  ✓ Đã nâng cấp thanh điều khiển ElevenLabs đầu bảng với bộ nhớ nhận diện thông minh!');
    } else {
      code = code.replace(headerAnchor, headerAnchor + topToolbarBanner);
      console.log('  ✓ Đã chèn mới thanh điều khiển ElevenLabs đầu bảng!');
    }
  }

  // 2.5 Also upgrade Inspector Component cn
  const inspectorSectionRegex = /e\.jsxs\("section",\{className:"flex flex-col gap-2\.5 rounded-lg border border-cyan-500\/25[\s\S]*?\]\}\),\]\}\),/g;
  const newInspectorSection = `e.jsxs("section",{className:"flex flex-col gap-2.5 rounded-lg border border-cyan-500/25 bg-cyan-950/20 p-3 shadow-[0_0_15px_rgba(6,182,212,0.06)]",children:[
    e.jsxs("div",{className:"flex items-center justify-between",children:[
      e.jsxs("label",{className:"text-[10px] font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5 cursor-pointer",onClick:()=>{const u=n.tts?.enabled;R(n.id,{tts:{enabled:!u,voiceId:n.tts?.voiceId||"aN7cv9yXNrfIR87bDmyD",voiceName:n.tts?.voiceName||"Ninh Đôn – Deep & Warm",script:n.tts?.script||"",modelId:n.tts?.modelId||"eleven_multilingual_v2"}})},children:["🎙️ ElevenLabs Voice (Lồng tiếng)"]}),
      e.jsx("button",{type:"button",onClick:()=>{const u=n.tts?.enabled;R(n.id,{tts:{enabled:!u,voiceId:n.tts?.voiceId||"aN7cv9yXNrfIR87bDmyD",voiceName:n.tts?.voiceName||"Ninh Đôn – Deep & Warm",script:n.tts?.script||"",modelId:n.tts?.modelId||"eleven_multilingual_v2"}})},className:\`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none \${n.tts?.enabled?"bg-cyan-500":"bg-white/10"}\`,children:e.jsx("span",{className:\`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out \${n.tts?.enabled?"translate-x-4":"translate-x-0"}\`})})
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
          e.jsx("option",{value:"TxGEqnHWrfWFTfGW9XjX",children:"Josh (Nam - Trẻ trung, tự tin)"}),
          ...(typeof window!=="undefined"&&window.localStorage?(()=>{
            try{
              const raw=window.localStorage.getItem("aiforge.ttsStudio.savedVoices.v1");
              const sv=raw?JSON.parse(raw):[];
              const defIds=new Set(["aN7cv9yXNrfIR87bDmyD","EcENCamMHdzIoMysqdsv","ipTvfDXAg1zowfF1rv9w","KVzG2JMdZJKi6y7cwERP","21m00Tcm4TlvDq8ikWAM","pNInz6obpgDQGcFmaJgB","ErXwobaYiN019PkySvjV","EXAVITQu4vr4xnSDxMaL","VR6AewLTigWG4xSOukaG","AZnzlk1XvdvUeBnXmlld","MF3mGyEYCl7XYWbV9V6O","TxGEqnHWrfWFTfGW9XjX"]);
              return sv.filter(x=>x&&x.voiceId&&!defIds.has(x.voiceId)).map(x=>e.jsx("option",{value:x.voiceId,children:\`★ \${x.voiceName||x.voiceId}\`},x.voiceId));
            }catch(_){return[];}
          })():[])
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
                if(res && (res.voiceName||res.name)){
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
                  if(res && (res.voiceName||res.name)){
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
                if(res && (res.voiceName||res.name)){
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

  if (inspectorSectionRegex.test(code)) {
    code = code.replace(inspectorSectionRegex, newInspectorSection);
    console.log('  ✓ Đã nâng cấp giao diện Inspector với nút Nhận diện & Bộ nhớ giọng!');
  }

  fs.writeFileSync(vsPath, code, 'utf8');
}

// ============================================================================
// RUN ALL PATCHES
// ============================================================================
for (const root of targetRoots) {
  if (!fs.existsSync(root)) continue;
  console.log('\n========================================');
  console.log('--- Xử lý tại thư mục:', root, '---');
  console.log('========================================');
  patchMainProcess(path.join(root, 'out/main/index.js'));
  patchVideoStudio(path.join(root, 'out/renderer/assets/VideoStudio-BZY_1pM8.js'));
}

// ============================================================================
// 3. SYNTAX INTEGRITY VERIFICATION
// ============================================================================
console.log('\n[*] Kiểm tra tính toàn vẹn cú pháp JS...');
for (const root of targetRoots) {
  const mainPath = path.join(root, 'out/main/index.js');
  if (fs.existsSync(mainPath)) {
    try {
      execSync(`node --check "${mainPath}"`, { stdio: 'inherit' });
      console.log('  [PASS] Cú pháp Main Process:', mainPath);
    } catch (err) {
      console.error('  [FAIL] Lỗi cú pháp trong:', mainPath);
      process.exit(1);
    }
  }
}

console.log('\n🎉 HOÀN THÀNH NÂNG CẤP ELEVENLABS TOÀN DIỆN CHO VIDEO STUDIO! 🎉');
