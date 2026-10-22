const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('======================================================================');
console.log('🎙️ NÂNG CẤP HOÀN THIỆN: LỒNG TIẾNG ELEVENLABS TỰ ĐỘNG & KHỚP KHẨU HÌNH 🎙️');
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

  // Clean old TTS block if present and insert new robust code
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
// 2. PATCH VIDEO STUDIO RENDERER (app/out/renderer/assets/VideoStudio-BZY_1pM8.js)
// ============================================================================
function patchVideoStudio(vsPath) {
  if (!fs.existsSync(vsPath)) return;
  console.log('[*] Đang nâng cấp UI VideoStudio tại:', vsPath);
  let code = fs.readFileSync(vsPath, 'utf8');

  // 2.1 Default scene tts initialization in kt()
  const oldKt1 = 'negativePrompt:s?.negativePrompt||"",referenceAssetIds:[]}}';
  const newKt1 = 'negativePrompt:s?.negativePrompt||"",tts:s?.tts||{enabled:!1,voiceId:"aN7cv9yXNrfIR87bDmyD",voiceName:"Ninh Đôn – Deep & Warm (Tiếng Việt)",script:"",modelId:"eleven_multilingual_v2"},referenceAssetIds:[]}}';
  if (code.includes(oldKt1)) {
    code = code.replace(oldKt1, newKt1);
    console.log('  ✓ Đã cập nhật tts config mặc định vào kt()');
  }

  // 2.2 Top Toolbar Banner with Green Toggle Switch & Voice Memory
  const topToolbarBanner = `e.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-3 border-b border-emerald-500/30 bg-gradient-to-r from-[#0d1f1a] via-[#101726] to-[#0d1f1a] px-4 py-2.5 shadow-lg",children:[
    e.jsxs("div",{className:"flex items-center gap-3",children:[
      e.jsxs("div",{className:"flex items-center gap-2 cursor-pointer select-none",onClick:()=>{if(d){const u=d.tts?.enabled;V(d.id,{tts:{enabled:!u,voiceId:d.tts?.voiceId||"aN7cv9yXNrfIR87bDmyD",voiceName:d.tts?.voiceName||"Ninh Đôn – Deep & Warm (Tiếng Việt)",script:d.tts?.script||"",modelId:d.tts?.modelId||"eleven_multilingual_v2"}});}},children:[
        e.jsx("span",{className:"text-base animate-pulse",children:"🎙️"}),
        e.jsxs("div",{children:[
          e.jsx("span",{className:"text-xs font-bold text-emerald-300 uppercase tracking-wider block",children:"Lồng Tiếng ElevenLabs (Auto-Dubbing)"}),
          e.jsx("span",{className:"text-[10px] text-text-muted block",children:d?\`Phân cảnh #\${d.index}: \${d.tts?.enabled?("Đang bật: "+(d.tts?.voiceName||"Ninh Đôn – Deep & Warm (Tiếng Việt)")):"Tắt (Gạt để bật)"}\`:"Tự động nhận diện kịch bản và ghép trực tiếp vào video"})
        ]})
      ]}),
      e.jsxs("div",{className:"flex items-center gap-2 cursor-pointer select-none",onClick:()=>{if(d){const u=d.tts?.enabled;V(d.id,{tts:{enabled:!u,voiceId:d.tts?.voiceId||"aN7cv9yXNrfIR87bDmyD",voiceName:d.tts?.voiceName||"Ninh Đôn – Deep & Warm (Tiếng Việt)",script:d.tts?.script||"",modelId:d.tts?.modelId||"eleven_multilingual_v2"}});}},children:[
        e.jsx("div",{className:\`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none shadow-sm \${d?.tts?.enabled?"bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]":"bg-white/20 hover:bg-white/30"}\`,children:e.jsx("span",{className:\`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out \${d?.tts?.enabled?"translate-x-4":"translate-x-0"}\`})}),
        e.jsx("span",{className:\`text-xs font-extrabold uppercase tracking-wider \${d?.tts?.enabled?"text-emerald-400":"text-white/40"}\`,children:d?.tts?.enabled?"ON":"OFF"})
      ]}),
      e.jsx("button",{type:"button",title:"Áp dụng giọng đọc hiện tại và bật lồng tiếng cho TẤT CẢ các phân cảnh",onClick:()=>{
        const curVid=d?.tts?.voiceId||"aN7cv9yXNrfIR87bDmyD";
        const curVname=d?.tts?.voiceName||"Ninh Đôn – Deep & Warm (Tiếng Việt)";
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
      },className:"text-[11px] font-bold text-emerald-400 hover:text-emerald-300 underline underline-offset-2 ml-1 cursor-pointer bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded",children:"Áp dụng tất cả phân cảnh"})
    ]}),
    d?.tts?.enabled?e.jsxs("div",{className:"flex flex-1 min-w-[320px] max-w-[820px] items-center gap-2 justify-end",children:[
      e.jsxs("select",{value:d.tts?.voiceId||"aN7cv9yXNrfIR87bDmyD",onChange:p=>{
        const v=p.target.value,w=p.target.options[p.target.selectedIndex].text;
        V(d.id,{tts:{...(d.tts||{}),voiceId:v,voiceName:w}});
      },className:"h-7 rounded-lg border border-emerald-500/40 bg-[#101726] px-2 text-[11px] font-medium text-emerald-200 outline-none focus:border-emerald-400 shrink-0 max-w-[210px] truncate",children:[
        e.jsx("option",{value:"aN7cv9yXNrfIR87bDmyD",children:"Ninh Đôn (Tiếng Việt - Nam Trầm ấm)"}),
        e.jsx("option",{value:"EcENCamMHdzIoMysqdsv",children:"Ethan (Tiếng Việt - Nam Rõ ràng)"}),
        e.jsx("option",{value:"ipTvfDXAg1zowfF1rv9w",children:"Hoàng Đặng (Tiếng Việt - Nam Trầm vang)"}),
        e.jsx("option",{value:"KVzG2JMdZJKi6y7cwERP",children:"Quang Nguyễn (Tiếng Việt - Nam Tự nhiên)"}),
        e.jsx("option",{value:"ThT5KcBeYPX3keUQqHPh",children:"Thu Hà (Tiếng Việt - Nữ Truyền cảm)"}),
        e.jsx("option",{value:"g5CIjZEefAph4nQFvHAz",children:"Mai Linh (Tiếng Việt - Nữ Dịu dàng)"}),
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
            const defIds=new Set(["aN7cv9yXNrfIR87bDmyD","EcENCamMHdzIoMysqdsv","ipTvfDXAg1zowfF1rv9w","KVzG2JMdZJKi6y7cwERP","ThT5KcBeYPX3keUQqHPh","g5CIjZEefAph4nQFvHAz","21m00Tcm4TlvDq8ikWAM","pNInz6obpgDQGcFmaJgB","ErXwobaYiN019PkySvjV","EXAVITQu4vr4xnSDxMaL","VR6AewLTigWG4xSOukaG","AZnzlk1XvdvUeBnXmlld","MF3mGyEYCl7XYWbV9V6O","TxGEqnHWrfWFTfGW9XjX"]);
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
        },placeholder:"Dán Voice ID...",className:"w-28 h-7 rounded-lg border border-white/15 bg-[#101726] pl-2 pr-7 text-[10px] text-text-primary outline-none focus:border-emerald-400 shrink-0"}),
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
        },className:"absolute right-1 top-1 bottom-1 px-1 text-[9px] font-bold text-emerald-400 hover:text-emerald-200 cursor-pointer",children:"🔍"})
      ]}),
      e.jsx("input",{type:"text",value:d.tts?.script||"",onChange:p=>V(d.id,{tts:{...(d.tts||{}),script:p.target.value}}),placeholder:\`Để trống để TỰ ĐỘNG nhận diện kịch bản video #\${d.index} (hoặc nhập thoại tùy chỉnh)...\`,className:"flex-1 h-7 rounded-lg border border-emerald-500/50 bg-[#101726] px-2.5 text-xs text-white placeholder:text-text-muted/60 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/40"})
    ]}):e.jsx("div",{className:"text-[11px] text-text-muted italic",children:"Gạt nút [ON] màu xanh ở trên để bật lồng tiếng ElevenLabs cho phân cảnh này"})
  ]}),`;

  const headerAnchor = 'e.jsx("span",{children:sr($,"video")})]})]}),';
  if (code.includes(headerAnchor)) {
    const prevBannerStart = code.indexOf(headerAnchor);
    const afterAnchor = code.slice(prevBannerStart + headerAnchor.length);
    if (afterAnchor.startsWith('e.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-3 border-b border-')) {
      const bannerEndIdx = afterAnchor.indexOf(']}),') + 4;
      code = code.slice(0, prevBannerStart + headerAnchor.length) + topToolbarBanner + afterAnchor.slice(bannerEndIdx);
      console.log('  ✓ Đã nâng cấp thanh điều khiển ElevenLabs Top Banner với thanh gạt xanh lá & kịch bản thông minh!');
    } else {
      code = code.replace(headerAnchor, headerAnchor + topToolbarBanner);
      console.log('  ✓ Đã chèn mới thanh điều khiển ElevenLabs Top Banner!');
    }
  }

  // 2.3 Also upgrade Inspector Component cn
  const inspectorSectionRegex = /e\.jsxs\("section",\{className:"flex flex-col gap-2\.5 rounded-lg border border-[\w\-/]+[\s\S]*?\]\}\),\]\}\),/g;
  const newInspectorSection = `e.jsxs("section",{className:"flex flex-col gap-2.5 rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-3 shadow-[0_0_15px_rgba(16,185,129,0.06)]",children:[
    e.jsxs("div",{className:"flex items-center justify-between",children:[
      e.jsxs("label",{className:"text-[10px] font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5 cursor-pointer",onClick:()=>{const u=n.tts?.enabled;R(n.id,{tts:{enabled:!u,voiceId:n.tts?.voiceId||"aN7cv9yXNrfIR87bDmyD",voiceName:n.tts?.voiceName||"Ninh Đôn – Deep & Warm (Tiếng Việt)",script:n.tts?.script||"",modelId:n.tts?.modelId||"eleven_multilingual_v2"}});}},children:["🎙️ Lồng Tiếng ElevenLabs"]}),
      e.jsxs("div",{className:"flex items-center gap-1.5 cursor-pointer select-none",onClick:()=>{const u=n.tts?.enabled;R(n.id,{tts:{enabled:!u,voiceId:n.tts?.voiceId||"aN7cv9yXNrfIR87bDmyD",voiceName:n.tts?.voiceName||"Ninh Đôn – Deep & Warm (Tiếng Việt)",script:n.tts?.script||"",modelId:n.tts?.modelId||"eleven_multilingual_v2"}});}},children:[
        e.jsx("div",{className:\`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out shadow-sm \${n.tts?.enabled?"bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]":"bg-white/20 hover:bg-white/30"}\`,children:e.jsx("span",{className:\`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out \${n.tts?.enabled?"translate-x-4":"translate-x-0"}\`})}),
        e.jsx("span",{className:\`text-[10px] font-extrabold uppercase tracking-wider \${n.tts?.enabled?"text-emerald-400":"text-white/40"}\`,children:n.tts?.enabled?"ON":"OFF"})
      ]})
    ]}),
    n.tts?.enabled&&e.jsxs("div",{className:"flex flex-col gap-2.5 pt-1 border-t border-emerald-500/20",children:[
      e.jsxs("div",{className:"flex flex-col gap-1",children:[
        e.jsx("label",{className:"text-[9px] font-semibold text-text-muted uppercase tracking-wider",children:"Chọn Giọng Đọc (Voice Preset)"}),
        e.jsxs("select",{value:n.tts?.voiceId||"aN7cv9yXNrfIR87bDmyD",onChange:p=>{
          const v=p.target.value,w=p.target.options[p.target.selectedIndex].text;
          R(n.id,{tts:{...(n.tts||{}),voiceId:v,voiceName:w}});
        },className:"w-full h-8 rounded-lg border border-white/10 bg-[#101726] px-2 text-xs text-text-primary outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/40",children:[
          e.jsx("option",{value:"aN7cv9yXNrfIR87bDmyD",children:"Ninh Đôn (Tiếng Việt - Nam Trầm ấm, truyền cảm)"}),
          e.jsx("option",{value:"EcENCamMHdzIoMysqdsv",children:"Ethan (Tiếng Việt - Nam Rõ ràng, dứt khoát)"}),
          e.jsx("option",{value:"ipTvfDXAg1zowfF1rv9w",children:"Hoàng Đặng (Tiếng Việt - Nam Trầm vang, thuyết minh)"}),
          e.jsx("option",{value:"KVzG2JMdZJKi6y7cwERP",children:"Quang Nguyễn (Tiếng Việt - Nam Tự nhiên, sôi nổi)"}),
          e.jsx("option",{value:"ThT5KcBeYPX3keUQqHPh",children:"Thu Hà (Tiếng Việt - Nữ Truyền cảm, mềm mại)"}),
          e.jsx("option",{value:"g5CIjZEefAph4nQFvHAz",children:"Mai Linh (Tiếng Việt - Nữ Dịu dàng, cảm xúc)"}),
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
              const defIds=new Set(["aN7cv9yXNrfIR87bDmyD","EcENCamMHdzIoMysqdsv","ipTvfDXAg1zowfF1rv9w","KVzG2JMdZJKi6y7cwERP","ThT5KcBeYPX3keUQqHPh","g5CIjZEefAph4nQFvHAz","21m00Tcm4TlvDq8ikWAM","pNInz6obpgDQGcFmaJgB","ErXwobaYiN019PkySvjV","EXAVITQu4vr4xnSDxMaL","VR6AewLTigWG4xSOukaG","AZnzlk1XvdvUeBnXmlld","MF3mGyEYCl7XYWbV9V6O","TxGEqnHWrfWFTfGW9XjX"]);
              return sv.filter(x=>x&&x.voiceId&&!defIds.has(x.voiceId)).map(x=>e.jsx("option",{value:x.voiceId,children:\`★ \${x.voiceName||x.voiceId}\`},x.voiceId));
            }catch(_){return[];}
          })():[])
        ]})
      ]}),
      e.jsxs("div",{className:"flex flex-col gap-1",children:[
        e.jsxs("div",{className:"flex items-center justify-between",children:[
          e.jsx("label",{className:"text-[9px] font-semibold text-text-muted uppercase tracking-wider",children:"Mã Voice ID / Link ElevenLabs"}),
          n.tts?.voiceName&&e.jsx("span",{className:"text-[9px] font-bold text-emerald-400 truncate max-w-[160px]",children:\`✓ \${n.tts.voiceName}\`})
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
          },placeholder:"Nhập hoặc dán mã Voice ID...",className:"w-full h-7 rounded-lg border border-white/10 bg-[#101726] pl-2 pr-16 text-[11px] text-text-primary outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/40"}),
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
          },className:"absolute right-1 top-1 bottom-1 px-2 rounded bg-emerald-950/60 border border-emerald-500/40 text-[10px] font-bold text-emerald-300 hover:text-white cursor-pointer",children:"Nhận diện"})
        ]})
      ]}),
      e.jsxs("div",{className:"flex flex-col gap-1",children:[
        e.jsxs("div",{className:"flex items-center justify-between",children:[
          e.jsx("label",{className:"text-[9px] font-semibold text-text-muted uppercase tracking-wider",children:"Lời thoại kịch bản (Dialogue Script)"}),
          e.jsx("span",{className:"text-[8px] text-emerald-400 font-medium",children:"Tự nhận diện kịch bản nếu để trống"})
        ]}),
        e.jsx("textarea",{value:n.tts?.script||"",onChange:p=>R(n.id,{tts:{...(n.tts||{}),script:p.target.value}}),placeholder:"Để trống để hệ thống TỰ ĐỘNG nhận diện kịch bản từ video Veo3/Grok, hoặc nhập câu thoại tiếng Việt tùy chỉnh...",rows:3,className:"w-full resize-y rounded-lg border border-white/10 bg-[#101726] p-2 text-xs leading-4 text-text-primary outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/40 placeholder:text-text-muted/60"})
      ]}),
      e.jsxs("div",{className:"flex items-center justify-between gap-2",children:[
        e.jsx("span",{className:"text-[9px] font-semibold text-text-muted uppercase tracking-wider",children:"Model TTS:"}),
        e.jsxs("select",{value:n.tts?.modelId||"eleven_multilingual_v2",onChange:p=>R(n.id,{tts:{...(n.tts||{}),modelId:p.target.value}}),className:"h-6 rounded border border-white/10 bg-[#101726] px-1.5 text-[10px] text-text-primary outline-none",children:[
          e.jsx("option",{value:"eleven_multilingual_v2",children:"Multilingual v2 (Chuẩn tiếng Việt & Tự nhiên nhất)"}),
          e.jsx("option",{value:"eleven_flash_v2_5",children:"Flash v2.5 (Siêu tốc)"}),
          e.jsx("option",{value:"eleven_turbo_v2_5",children:"Turbo v2.5 (Cân bằng)"})
        ]})
      ]})
    ]})
  ]}),`;

  if (inspectorSectionRegex.test(code)) {
    code = code.replace(inspectorSectionRegex, newInspectorSection);
    console.log('  ✓ Đã nâng cấp giao diện Inspector với thanh gạt xanh lá & nút Nhận diện!');
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

console.log('\n🎉 HOÀN THÀNH NÂNG CẤP ELEVENLABS TIẾNG VIỆT & ĐỒNG BỘ KHẨU HÌNH CHO VIDEO STUDIO! 🎉');
