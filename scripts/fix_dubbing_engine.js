const fs = require('fs');
const path = require('path');

console.log('=== SỬA TRIỆT ĐỂ LỖI DUBBING PROBE VÀ ENHANCE RUNNER ===');

// 1. PATCH app/out/main/index.js
const mainFile = path.join(__dirname, '../app/out/main/index.js');
let mainCode = fs.readFileSync(mainFile, 'utf8');

// Replace syncVoiceoverVideo implementation
const oldSyncStart = mainCode.indexOf('async syncVoiceoverVideo(');
const oldSyncEnd = mainCode.indexOf('async muxAudioIntoVideo(');

if (oldSyncStart === -1 || oldSyncEnd === -1) {
  console.error('Could not find syncVoiceoverVideo in main/index.js!');
  process.exit(1);
}

const newSyncMethod = `async syncVoiceoverVideo(videoAssetId, audioAssetId, options = {}) {
  const { signal: n } = options;
  F(n);
  const cleanVidId = typeof videoAssetId === "string" ? videoAssetId.replace(/^.*\\/asset\\//, "").replace(/\\?.*$/, "").trim() : "";
  let vAsset = cleanVidId ? this.getAsset(cleanVidId) : null;
  if (!vAsset && videoAssetId) vAsset = this.getAsset(videoAssetId);

  const cleanAudId = typeof audioAssetId === "string" ? audioAssetId.replace(/^.*\\/asset\\//, "").replace(/\\?.*$/, "").trim() : "";
  let aAsset = cleanAudId ? this.getAsset(cleanAudId) : null;
  if (!aAsset && audioAssetId) aAsset = this.getAsset(audioAssetId);

  // Auto-detect and swap if user connected video and audio in reverse
  if (vAsset && aAsset) {
    if (vAsset.type === "audio" && aAsset.type === "video") {
      const tmp = vAsset;
      vAsset = aAsset;
      aAsset = tmp;
    }
  }

  // Fallbacks if not found by id
  if (!vAsset && this.state.assets.length > 0) {
    vAsset = this.state.assets.filter(a => a.type === "video").slice(-1)[0];
  }
  if (!aAsset && this.state.assets.length > 0) {
    aAsset = this.state.assets.filter(a => a.type === "audio").slice(-1)[0];
  }

  if (!vAsset) throw new m("PROVIDER_REJECTED", "Missing video asset " + videoAssetId);
  if (vAsset.type !== "video") throw new Error("Asset " + videoAssetId + " is not a video file");

  if (!aAsset) throw new m("PROVIDER_REJECTED", "Missing audio asset " + audioAssetId);
  if (aAsset.type !== "audio") throw new Error("Asset " + audioAssetId + " is not an audio file");

  const ffmpegBin = await oa(n);
  const vProbe = await bo(ffmpegBin, vAsset.localPath, n);
  F(n);

  // Probe audio duration safely without calling bo() which expects video streams
  let aDur = 5.0;
  try {
    const probeProc = ln(ffmpegBin, ["-hide_banner", "-i", aAsset.localPath]);
    let probeBuf = "";
    probeProc.stderr.on("data", chunk => { probeBuf += chunk.toString(); });
    await new Promise(res => probeProc.on("close", res));
    const durMatch = probeBuf.match(/Duration:\\s*(\\d{2}):(\\d{2}):(\\d{2}(?:\\.\\d+)?)/);
    if (durMatch) {
      aDur = Math.max(0.1, Number(durMatch[1]) * 3600 + Number(durMatch[2]) * 60 + Number(durMatch[3]));
    }
  } catch (_) {
    aDur = 5.0;
  }
  F(n);

  const vDur = Math.max(0.1, vProbe.duration || 5);
  await lt(this.filesDir, { recursive: true });

  const tempOut = N(this.filesDir, "dubbed_sync_" + M() + ".mp4");
  try {
    let targetSpeed = 1.0;
    if (options.speedMode === "custom" && typeof options.customSpeed === "number") {
      targetSpeed = Math.max(0.5, Math.min(2.0, options.customSpeed));
    } else {
      targetSpeed = aDur / vDur;
      targetSpeed = Math.max(0.65, Math.min(1.55, targetSpeed));
      if (Math.abs(targetSpeed - 1.0) < 0.03) targetSpeed = 1.0;
    }

    const voiceFilters = [];
    if (Math.abs(targetSpeed - 1.0) >= 0.03) {
      if (targetSpeed > 2.0) {
        voiceFilters.push("atempo=2.0,atempo=" + (targetSpeed / 2.0).toFixed(3));
      } else if (targetSpeed < 0.5) {
        voiceFilters.push("atempo=0.5,atempo=" + (targetSpeed / 0.5).toFixed(3));
      } else {
        voiceFilters.push("atempo=" + targetSpeed.toFixed(3));
      }
    }

    const mood = options.mood || "viral_climax";
    const intensity = typeof options.intensity === "number" ? Math.max(0.5, Math.min(1.5, options.intensity)) : 1.0;

    voiceFilters.push("highpass=f=70");

    if (mood === "viral_climax" || mood === "dramatic") {
      voiceFilters.push(\`equalizer=f=180:width_type=h:width=120:g=\${(2.5 * intensity).toFixed(1)}\`);
      voiceFilters.push(\`equalizer=f=3600:width_type=h:width=1200:g=\${(3.2 * intensity).toFixed(1)}\`);
      voiceFilters.push("compand=attacks=0.02:decays=0.15:points=-80/-80|-40/-30|-20/-14|0/-8:soft-knee=6");
      voiceFilters.push("loudnorm=I=-15:LRA=9:TP=-1.2");
    } else if (mood === "broadcast") {
      voiceFilters.push("equalizer=f=200:width_type=h:width=100:g=1.5");
      voiceFilters.push("equalizer=f=4000:width_type=h:width=1000:g=2.5");
      voiceFilters.push("loudnorm=I=-16:LRA=10:TP=-1.5");
    } else if (mood === "crisp") {
      voiceFilters.push("equalizer=f=3800:width_type=h:width=1000:g=3.5");
      voiceFilters.push("loudnorm=I=-16:LRA=11:TP=-1.5");
    } else if (mood === "sales_punch") {
      voiceFilters.push("equalizer=f=250:width_type=h:width=150:g=2.0");
      voiceFilters.push("equalizer=f=3200:width_type=h:width=800:g=3.8");
      voiceFilters.push("compand=attacks=0.01:decays=0.1:points=-70/-70|-35/-22|0/-6:soft-knee=4");
      voiceFilters.push("loudnorm=I=-14:LRA=8:TP=-1.0");
    } else {
      voiceFilters.push("loudnorm=I=-16:LRA=11:TP=-1.5");
    }

    const voiceVol = typeof options.voiceVolume === "number" ? Math.max(0.1, Math.min(2.5, options.voiceVolume / 100)) : 1.0;
    if (Math.abs(voiceVol - 1.0) > 0.05) {
      voiceFilters.push("volume=" + voiceVol.toFixed(2));
    }

    voiceFilters.push("aresample=48000,aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo");
    const voiceChain = voiceFilters.join(",");

    const removeOriginal = options.removeOriginalAudio !== false && options.keepBackgroundMusic !== true;
    const args = ["-hide_banner", "-loglevel", "error", "-y", "-i", vAsset.localPath, "-i", aAsset.localPath];

    if (removeOriginal) {
      args.push("-filter_complex", \`[1:a]\${voiceChain}[aout]\`);
      args.push("-map", "0:v:0", "-map", "[aout]");
    } else {
      const bgmVol = typeof options.bgmVolume === "number" ? (options.bgmVolume / 100).toFixed(2) : "0.15";
      args.push("-filter_complex", \`[0:a]volume=\${bgmVol}[bgm];[1:a]\${voiceChain}[voice];[bgm][voice]amix=inputs=2:duration=first:dropout_transition=2[aout]\`);
      args.push("-map", "0:v:0", "-map", "[aout]");
    }

    args.push("-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-shortest", "-movflags", "+faststart", tempOut);

    await fr(ffmpegBin, args, Pt, n);
    F(n);

    const bytes = await ke(tempOut, { signal: n });
    const finalName = (options.name && options.name.trim()) || ("Dubbed_Sync_" + (vAsset.name || Date.now() + ".mp4"));
    return await this.writeAsset({
      id: M(),
      name: finalName,
      type: "video",
      role: "generated",
      mimeType: "video/mp4",
      bytes: bytes,
      ratio: Mg(vProbe.width, vProbe.height),
      createdAt: new Date().toISOString()
    }, { signal: n });
  } finally {
    try { await We(tempOut); } catch (_) {}
  }
}
`;

mainCode = mainCode.slice(0, oldSyncStart) + newSyncMethod + '\n' + mainCode.slice(oldSyncEnd);
fs.writeFileSync(mainFile, mainCode, 'utf8');
console.log('✓ Successfully updated syncVoiceoverVideo in main/index.js!');

// 2. PATCH app/out/renderer/assets/useWorkflowRunner-BmcV20yZ.js
const runnerFile = path.join(__dirname, '../app/out/renderer/assets/useWorkflowRunner-BmcV20yZ.js');
let runnerCode = fs.readFileSync(runnerFile, 'utf8');

const runnerDubStart = runnerCode.indexOf('else if(r.type==="video-dubbing"||r.type==="dubbing"){');
const runnerDubEnd = runnerCode.indexOf('else if(r.type==="video-script-extract"||r.type==="stt"){');

if (runnerDubStart === -1 || runnerDubEnd === -1) {
  console.error('Could not find video-dubbing in useWorkflowRunner!');
  process.exit(1);
}

const newRunnerDubBlock = `else if(r.type==="video-dubbing"||r.type==="dubbing"){
  let vid=(b.videos&&b.videos[0])||(b.images&&b.images[0]);
  let aud=b.audios&&b.audios[0];
  if(!vid||!aud){
    const inConns=E.filter(y=>y.toNode===r.id);
    for(const conn of inConns){
      const upVal=u.get(conn.fromNode);
      if(!vid&&upVal?.videos&&upVal.videos.length>0) vid=upVal.videos[0];
      if(!vid&&upVal?.outputAssets&&upVal.outputAssets.some(oa=>oa.type==="video")) {
        const vAsset=upVal.outputAssets.find(oa=>oa.type==="video");
        vid={assetId:vAsset.assetId||vAsset.id,url:vAsset.url,thumbnailUrl:vAsset.thumbnailUrl,mimeType:vAsset.mimeType};
      }
      if(!aud&&upVal?.audios&&upVal.audios.length>0) aud=upVal.audios[0];
      if(!aud&&upVal?.outputAssets&&upVal.outputAssets.some(oa=>oa.type==="audio")) {
        const aAsset=upVal.outputAssets.find(oa=>oa.type==="audio");
        aud={assetId:aAsset.assetId||aAsset.id,url:aAsset.url,mimeType:aAsset.mimeType};
      }
    }
  }
  if(!vid)throw new Error(\`\${r.title} cần 1 video đầu vào (từ Veo 3 hoặc thư viện).\`);
  if(!aud)throw new Error(\`\${r.title} cần 1 file âm thanh đầu vào (từ ElevenLabs).\`);
  D(r,"AI Đang phân tích nhịp điệu & cao trào để lồng tiếng chuẩn xác...","info",{phase:"analyze"});
  v(r.id,25);
  y(r.id,{progress:25,statusText:"Đang phân tích nhịp điệu & cao trào"});
  const C=window.aiforge?.assets;
  if(!C?.syncVoiceoverVideo&&!C?.muxAudioVideo)throw new Error("Chức năng lồng tiếng video chưa khả dụng trong preload.");
  const syncFn=C.syncVoiceoverVideo||C.muxAudioVideo;
  const vidId=vid.assetId||vid.id||(typeof vid.url==="string"?vid.url.replace(/^.*\\/asset\\//,"").replace(/\\?.*$/,""):"");
  const audId=aud.assetId||aud.id||(typeof aud.url==="string"?aud.url.replace(/^.*\\/asset\\//,"").replace(/\\?.*$/,""):"");
  v(r.id,50);
  y(r.id,{progress:50,statusText:"Đang xử lý âm thanh & co giãn nhịp điệu"});
  D(r,\`Đang áp dụng bộ lọc giọng đọc: \${r.config?.mood||"Cao trào Viral (Ấm & Dày tiếng)"}\`,"info",{phase:"process"});

  const dubbed=await yo(m,de=>syncFn(vidId,audId,{
    operationId:de,
    speedMode:r.config?.speedMode||"auto",
    customSpeed:typeof r.config?.customSpeed==="number"?r.config.customSpeed:1.0,
    mood:r.config?.mood||"viral_climax",
    intensity:typeof r.config?.intensity==="number"?r.config.intensity:1.0,
    voiceVolume:typeof r.config?.voiceVolume==="number"?r.config.voiceVolume:100,
    removeOriginalAudio:r.config?.removeOriginalAudio!==false,
    keepBackgroundMusic:r.config?.keepBackgroundMusic===true,
    bgmVolume:typeof r.config?.bgmVolume==="number"?r.config.bgmVolume:15,
    name:r.config?.outputName||("Video_Dubbed_"+Date.now()+".mp4")
  }),C.cancelMerge);

  if(m?.aborted)throw new Qe;
  const te=dubbed.ratio||r.config?.outputAspect||"16:9",ce=Ca(te);
  D(r,\`Video đã lồng tiếng hoàn tất với âm thanh sống động: \${dubbed.name}\`,"success",{phase:"result"});
  U.videos.push({assetId:dubbed.id,url:dubbed.url,thumbnailUrl:dubbed.thumbnailUrl,mimeType:dubbed.mimeType});
  v(r.id,95);
  y(r.id,{progress:95,statusText:"Hoàn tất lồng tiếng video",width:ce.width,height:ce.height,config:{...r.config,src:dubbed.url,outputAspect:te,outputAssets:[{type:"video",url:dubbed.url,assetId:dubbed.id,thumbnailUrl:dubbed.thumbnailUrl,mimeType:dubbed.mimeType}]}});
}
`;

runnerCode = runnerCode.slice(0, runnerDubStart) + newRunnerDubBlock + runnerCode.slice(runnerDubEnd);
fs.writeFileSync(runnerFile, runnerCode, 'utf8');
console.log('✓ Successfully updated useWorkflowRunner-BmcV20yZ.js!');
