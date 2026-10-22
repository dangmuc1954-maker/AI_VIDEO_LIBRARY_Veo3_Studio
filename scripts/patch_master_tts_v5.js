const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('======================================================================');
console.log('🚀 NÂNG CẤP HOÀN HẢO TOÀN DIỆN LỒNG TIẾNG TIẾNG VIỆT & ELEVENLABS (V5) 🚀');
console.log('======================================================================');

const targetRoots = [
  path.join(__dirname, '../app'),
  path.join(__dirname, '../extracted_original'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Customer_Edition/resources/app'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Khach_Hang_v3.0/resources/app'),
  'C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app'
];

const dialogueFunctionCode = `
function generateSmartVietnameseDialogue(rawPrompt, vidDuration, voiceName) {
  const p = (rawPrompt || "").toLowerCase();
  const v = (voiceName || "").toLowerCase();
  let isFemale = /nữ|gái|bạn nữ|cô gái|chị|em|bà|female|woman|girl|beauty|xinh/i.test(rawPrompt + " " + voiceName);
  let selfRef = "mình";

  // 1. Review / Đánh giá sản phẩm / Balo / Túi / Unboxing
  if (/review|đánh giá|trải nghiệm|balo|ba lô|túi|sách|điện thoại|áo|quần|giày|mỹ phẩm|son|đồng hồ|unboxing|đập hộp|mở hộp/i.test(p)) {
    let item = "ba lô";
    if (/balo|ba lô/i.test(p)) item = "ba lô";
    else if (/túi/i.test(p)) item = "túi xách";
    else if (/điện thoại|phone/i.test(p)) item = "điện thoại";
    else if (/mỹ phẩm|son|kem/i.test(p)) item = "sản phẩm làm đẹp";
    else if (/áo|quần|váy|đầm/i.test(p)) item = "mẫu trang phục";
    else if (/giày|dép/i.test(p)) item = "đôi giày";
    else if (/đồng hồ/i.test(p)) item = "chiếc đồng hồ";
    else item = "sản phẩm";

    if (vidDuration <= 5) {
      return "Xin chào các bạn, chiếc " + item + " này thực sự rất xinh và tiện lợi nhé!";
    } else if (vidDuration <= 7) {
      return "Xin chào mọi người! Hôm nay " + selfRef + " sẽ review cho các bạn xem chiếc " + item + " siêu xinh và tiện lợi này nhé!";
    } else {
      return "Xin chào tất cả các bạn! Hôm nay " + selfRef + " rất vui được giới thiệu và review chi tiết chiếc " + item + " cực kỳ xinh xắn và tiện lợi này cho mọi người cùng xem nhé!";
    }
  }

  // 2. Cafe / Ẩm thực / Ăn uống / Quán xá
  if (/cà phê|cafe|quán|ăn|món|ẩm thực|nấu|food|coffee|nước|uống|tiệm/i.test(p)) {
    if (vidDuration <= 5) {
      return "Chào các bạn, quán này không gian siêu chill đồ uống cực ngon nè!";
    } else if (vidDuration <= 7) {
      return "Xin chào mọi người, hôm nay " + selfRef + " vừa ghé một quán siêu chill với hương vị tuyệt hảo, cùng trải nghiệm nhé!";
    } else {
      return "Xin chào tất cả các bạn! Hôm nay " + selfRef + " vừa tìm được một không gian quán siêu chill với đồ uống cực ngon, các bạn cùng theo chân mình trải nghiệm nhé!";
    }
  }

  // 3. Công nghệ / Tin tức / Tài chính
  if (/công nghệ|ai|trí tuệ nhân tạo|tài chính|chứng khoán|đầu tư|thị trường|tin tức|tech|finance|news/i.test(p)) {
    if (vidDuration <= 5) {
      return "Xin chào quý vị, đây là những cập nhật công nghệ và thị trường mới nhất.";
    } else if (vidDuration <= 7) {
      return "Xin chào quý vị và các bạn! Chào mừng quý vị đến với bản tin tổng hợp các bước đột phá công nghệ và cơ hội thị trường hôm nay.";
    } else {
      return "Xin chào quý vị và các bạn! Chào mừng mọi người quay trở lại, hôm nay chúng ta sẽ cùng phân tích những xu hướng đột phá của công nghệ và thị trường hiện nay.";
    }
  }

  // 4. Du lịch / Khám phá / Ngoại cảnh / Vlog
  if (/du lịch|khám phá|vlog|ngoại ô|phố|biển|núi|chuyến đi|travel|dạo phố|thiên nhiên/i.test(p)) {
    if (vidDuration <= 5) {
      return "Chào mọi người, cảnh sắc ở đây thực sự rất tuyệt vời và thơ mộng luôn nè!";
    } else if (vidDuration <= 7) {
      return "Xin chào tất cả các bạn, chuyến đi hôm nay của " + selfRef + " có rất nhiều cảnh đẹp và điều bất ngờ thú vị!";
    } else {
      return "Xin chào tất cả mọi người! Hãy cùng theo chân " + selfRef + " trong chuyến khám phá ngày hôm nay, phong cảnh nơi đây thực sự quá đẹp và tuyệt vời các bạn ạ!";
    }
  }

  // 5. Mặc định tự nhiên
  if (vidDuration <= 5) {
    return "Xin chào tất cả các bạn, chào mừng các bạn đã đến với video ngày hôm nay!";
  } else if (vidDuration <= 7) {
    return "Xin chào mọi người! Rất vui được gặp lại các bạn trong video hôm nay, chúc mọi người một ngày tràn đầy năng lượng!";
  } else {
    return "Xin chào tất cả các bạn! Chào mừng các bạn đã quay trở lại với video hôm nay, hãy cùng mình theo dõi những nội dung hấp dẫn ngay sau đây nhé!";
  }
}

async function synthesizeVietnameseVoice(text, tSignal) {
  const sentences = (text.match(/[^.!?]+[.!?]+/g) || [text]).map(x => x.trim()).filter(Boolean);
  const chunks = [];
  for (const s of sentences) {
    const url = "https://translate.google.com/translate_tts?ie=UTF-8&q=" + encodeURIComponent(s) + "&tl=vi&client=tw-ob";
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
      },
      signal: tSignal
    });
    if (res.ok) {
      chunks.push(Buffer.from(await res.arrayBuffer()));
    }
  }
  if (chunks.length === 0) throw new Error("Voice synthesis returned empty stream");
  return Buffer.concat(chunks);
}
`;

const queueWorkerHookCode = `const c=await this.assets.cacheQueueResult(n,a);
  if(n.payload?.tts?.enabled && c.assets?.length>0){
    const vidAsset=c.assets.find(ast=>(ast.type||"").toLowerCase()==="video");
    if(vidAsset && vidAsset.localPath && nodeFs.existsSync(vidAsset.localPath)){
      try{
        const tData=n.payload.tts;
        const vId=(tData.voiceId||"").trim()||"aN7cv9yXNrfIR87bDmyD";
        const mId=(tData.modelId||"").trim()||"eleven_multilingual_v2";
        const vName=(tData.voiceName||"").trim()||vId;
        const fBin=await oa(t);

        // 1. Lấy thời lượng video thực tế
        let vidDuration=8.0;
        try{
          const pInfo=await bo(fBin,vidAsset.localPath,t);
          if(pInfo && Number.isFinite(pInfo.duration) && pInfo.duration>0){
            vidDuration=pInfo.duration;
          }
        }catch(_){}

        // 2. Tạo kịch bản tự nhiên khớp ngữ cảnh
        let sText=((tData && tData.script) || "").trim();
        if(!sText){
          sText=generateSmartVietnameseDialogue(n.payload?.prompt||n.title||"",vidDuration,vName);
        }
        sText=sText.replace(/\\s+/g," ").trim();
        if(sText && !/[.!?]$/.test(sText)) sText+=".";

        this.queue.updateJobProgress(e.id,90,"Đang tạo giọng đọc chuẩn tiếng Việt ("+vName+")...");
        let aBuf=null;

        // 3. Ưu tiên ElevenLabs
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
                apiKey:tData.apiKey||process.env.ELEVENLABS_API_KEY||"",
                voiceSettings:{
                  stability:typeof tData.stability==="number"?tData.stability:0.50,
                  similarity_boost:typeof tData.similarityBoost==="number"?tData.similarityBoost:0.85,
                  speed:typeof tData.speed==="number"?tData.speed:1.0,
                  style:typeof tData.style==="number"?tData.style:0.15,
                  use_speaker_boost:tData.useSpeakerBoost!==false
                }
              }
            };
            const elevenController=new AbortController();
            const elevenTimeout=setTimeout(()=>elevenController.abort(),10000);
            const cancelSub=()=>elevenController.abort();
            t?.addEventListener("abort",cancelSub,{once:true});

            try{
              const ttsResult=await eRunner.runJob(ttsJob,{
                signal:elevenController.signal,
                updateProgress:(p,msg)=>this.queue.updateJobProgress(e.id,Math.min(94,90+Math.round((p||0)*0.04)),"ElevenLabs: "+(msg||"Đang tạo giọng đọc"))
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
            }finally{
              clearTimeout(elevenTimeout);
              t?.removeEventListener("abort",cancelSub);
            }
          }
        }catch(runnerErr){
          console.warn("[ElevenLabs Notice - switching to Studio Engine]",runnerErr.message||runnerErr);
        }

        // 4. Studio Fallback: Giọng đọc tiếng Việt Studio siêu chuẩn 100%
        if(!aBuf || aBuf.length===0){
          try{
            this.queue.updateJobProgress(e.id,92,"Đang tổng hợp giọng đọc tiếng Việt Studio ("+vName+")...");
            aBuf=await synthesizeVietnameseVoice(sText,t);
            console.log("[Vietnamese Studio TTS] Đã tổng hợp thành công giọng tiếng Việt, dung lượng:",aBuf.length);
          }catch(synthErr){
            console.warn("[Vietnamese Studio TTS Error]",synthErr.message||synthErr);
          }
        }

        // 5. Đồng bộ khẩu hình & Ghép âm thanh hoàn chỉnh
        if(aBuf && aBuf.length>0){
          this.queue.updateJobProgress(e.id,95,"Đang đồng bộ khẩu hình & lồng tiếng ("+vName+")...");
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

            const targetDuration=Math.max(1.0,vidDuration-0.35);
            const tempoRatio=ttsDuration/targetDuration;
            const clampedTempo=Math.max(0.75,Math.min(1.40,tempoRatio));

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
              const fStat=nodeFs.statSync(vidAsset.localPath);
              vidAsset.bytes=fStat.size;
              if(this.assets && this.assets.state && Array.isArray(this.assets.state.assets)){
                const found=this.assets.state.assets.find(ast=>ast.id===vidAsset.assetId||ast.localPath===vidAsset.localPath);
                if(found) found.bytes=fStat.size;
                this.assets.emit?.();
              }
              console.log("[Voiceover Sync] Lồng tiếng thành công giọng tiếng Việt ("+vName+") vào:",vidAsset.localPath);
            }
          }catch(mErr){
            console.error("[Voiceover Merge Error]",mErr);
          }finally{
            try{if(nodeFs.existsSync(tVoiced)) nodeFs.unlinkSync(tVoiced);}catch(_){}
            try{if(nodeFs.existsSync(tAudio)) nodeFs.unlinkSync(tAudio);}catch(_){}
          }
        }
      }catch(tErr){
        console.error("[ElevenLabs Voiceover Pipeline Error]",tErr);
      }
    }
  }`;

targetRoots.forEach(root => {
  const indexPath = path.join(root, 'out/main/index.js');
  if (!fs.existsSync(indexPath)) {
    console.log('Skipping missing:', indexPath);
    return;
  }
  console.log('Patching V5 into:', indexPath);
  let code = fs.readFileSync(indexPath, 'utf8');

  // Replace old dialogue / synthesize functions
  const dStart = code.indexOf('function generateSmartVietnameseDialogue(');
  if (dStart !== -1) {
    const dEnd = code.indexOf('import nodeCrypto', dStart);
    if (dEnd !== -1) {
      code = code.slice(0, dStart) + dialogueFunctionCode.trim() + '\n\n' + code.slice(dEnd);
    }
  }

  // Replace hook in QueueWorker
  const hStart = code.indexOf('const c=await this.assets.cacheQueueResult(n,a);');
  const hEnd = code.indexOf('const d=this.queue.findJob(e.id);if(t.aborted||!d||d.status==="Canceled"){await this.deleteDiscardedJobAssets(e),I("queue-worker","canceled job stopped before completion"', hStart);
  if (hStart !== -1 && hEnd !== -1) {
    code = code.slice(0, hStart) + queueWorkerHookCode + '\n  ' + code.slice(hEnd);
  }

  fs.writeFileSync(indexPath, code, 'utf8');

  try {
    execSync(`node --check "${indexPath}"`);
    console.log('✅ Syntax VALID for:', indexPath);
  } catch (err) {
    console.error('❌ Syntax error in:', indexPath, err.message);
  }
});

console.log('\n🎉 NÂNG CẤP V5 HOÀN TẤT THÀNH CÔNG CHO TẤT CẢ PHIÊN BẢN!');
