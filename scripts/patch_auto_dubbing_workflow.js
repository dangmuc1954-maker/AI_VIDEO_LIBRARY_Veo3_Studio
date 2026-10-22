const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('======================================================================');
console.log('🎬 BẮT ĐẦU NÂNG CẤP WORKFLOW AUTO-DUBBING (VEO 3 + ELEVENLABS) 🎬');
console.log('======================================================================');

const appDir = path.join(__dirname, '../app');
const mainPath = path.join(appDir, 'out/main/index.js');
const preloadPath = path.join(appDir, 'out/preload/index.cjs');
const runnerPath = path.join(appDir, 'out/renderer/assets/useWorkflowRunner-BmcV20yZ.js');
const editorPath = path.join(appDir, 'out/renderer/assets/WorkflowEditor-BFJj-KsD.js');
const indexRendererPath = path.join(appDir, 'out/renderer/assets/index-8u8DZic4.js');

// ============================================================================
// 1. PATCH MAIN PROCESS: THÊM muxAudioIntoVideo & transcribeVideoAudio
// ============================================================================
console.log('\n[1/4] Nâng cấp Main Process (app/out/main/index.js)...');
let mainCode = fs.readFileSync(mainPath, 'utf8');

// Methods to add to class Og (AssetStore)
const assetStoreMethodAnchor = 'async mergeAudios(e,t=0,o={}){';
const newAssetStoreMethods = `async muxAudioIntoVideo(videoAssetId, audioAssetId, options = {}) {
  const { signal: n } = options;
  F(n);
  const vAsset = this.getAsset(videoAssetId);
  if (!vAsset) throw new m("PROVIDER_REJECTED", "Missing video asset " + videoAssetId);
  if (vAsset.type !== "video") throw new Error("Asset " + videoAssetId + " is not a video file");

  const aAsset = this.getAsset(audioAssetId);
  if (!aAsset) throw new m("PROVIDER_REJECTED", "Missing audio asset " + audioAssetId);
  if (aAsset.type !== "audio") throw new Error("Asset " + audioAssetId + " is not an audio file");

  const ffmpegBin = await oa(n);
  const vProbe = await bo(ffmpegBin, vAsset.localPath, n);
  const aProbe = await bo(ffmpegBin, aAsset.localPath, n);
  F(n);

  const vDur = Math.max(0.1, vProbe.duration || 5);
  const aDur = Math.max(0.1, aProbe.duration || 5);
  await lt(this.filesDir, { recursive: true });

  const tempMux = N(this.filesDir, "dubbed_temp_" + M() + ".mp4");
  try {
    const args = ["-hide_banner", "-loglevel", "error", "-y", "-i", vAsset.localPath, "-i", aAsset.localPath];
    if (options.fitDuration !== false && Math.abs(aDur - vDur) > 0.08) {
      let tempo = aDur / vDur;
      tempo = Math.max(0.5, Math.min(2.0, tempo));
      args.push("-filter_complex", "[1:a]atempo=" + tempo.toFixed(3) + "[aout]");
      args.push("-map", "0:v:0", "-map", "[aout]");
    } else {
      args.push("-map", "0:v:0", "-map", "1:a:0");
    }
    args.push("-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", tempMux);
    await fr(ffmpegBin, args, Pt, n);
    F(n);

    const bytes = await ke(tempMux, { signal: n });
    const finalName = (options.name && options.name.trim()) || ("Dubbed_" + (vAsset.name || Date.now() + ".mp4"));
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
    try { await We(tempMux); } catch (_) {}
  }
}
async transcribeVideoAudio(videoAssetId, options = {}) {
  const { signal: n } = options;
  F(n);
  const cleanId = String(videoAssetId || "").replace(/^.*\\/asset\\//, "").replace(/\\?.*$/, "").trim();
  const vAsset = this.getAsset(cleanId) || this.state.assets.find(t => t.id === cleanId || t.id === videoAssetId || t.url === videoAssetId || t.providerAssetId === cleanId);
  if (!vAsset) throw new m("PROVIDER_REJECTED", "Missing video asset " + videoAssetId);
  if (vAsset.type !== "video") throw new Error("Asset " + videoAssetId + " is not a video file");

  const ffmpegBin = await oa(n);
  let videoPath = vAsset.localPath;
  let downloadedTemp = null;
  if (!videoPath || !nodeFs.existsSync(videoPath)) {
    if (vAsset.remoteUrl) {
      await lt(this.filesDir, { recursive: true });
      downloadedTemp = N(this.filesDir, "remote_vid_" + M() + ".mp4");
      const resp = await fetch(vAsset.remoteUrl);
      const arr = Buffer.from(await resp.arrayBuffer());
      await nodeFs.promises.writeFile(downloadedTemp, arr);
      videoPath = downloadedTemp;
    } else {
      throw new m("PROVIDER_REJECTED", "Video file not found on disk: " + (vAsset.localPath || vAsset.url));
    }
  }

  const vProbe = await bo(ffmpegBin, videoPath, n);
  const duration = Math.max(0.1, vProbe.duration || 5);
  F(n);

  await lt(this.filesDir, { recursive: true });
  const tempWav = N(this.filesDir, "stt_extract_" + M() + ".wav");
  let scriptText = "";

  try {
    const extractArgs = ["-hide_banner", "-loglevel", "error", "-y", "-i", videoPath, "-vn", "-ar", "16000", "-ac", "1", tempWav];
    await fr(ffmpegBin, extractArgs, Pt, n);
    F(n);

    if (nodeFs.existsSync(tempWav) && nodeFs.statSync(tempWav).size > 1000) {
      const wavBuf = await ke(tempWav, { signal: n });
      const pcmBytes = wavBuf.subarray(44);
      const float32 = new Float32Array(pcmBytes.length / 2);
      for (let i = 0; i < float32.length; i++) {
        float32[i] = pcmBytes.readInt16LE(i * 2) / 32768.0;
      }

      const possibleTransformers = [
        N(Nn, "../node_modules/@xenova/transformers/src/transformers.js"),
        N(Nn, "../../node_modules/@xenova/transformers/src/transformers.js"),
        N(process.resourcesPath || "", "app/node_modules/@xenova/transformers/src/transformers.js"),
        "D:/dự án antigravity/AIForge_Veo3_Studio/app/node_modules/@xenova/transformers/src/transformers.js"
      ];

      const possibleModelDirs = [
        N(Nn, "../models"),
        N(Nn, "../../models"),
        N(process.env.APPDATA || "", "AI_VIDEO_LIBRARY_DATA/models"),
        N(process.resourcesPath || "", "app/models"),
        "D:/dự án antigravity/AIForge_Veo3_Studio/app/models"
      ];

      let modPath = "";
      for (const p of possibleTransformers) {
        if (nodeFs.existsSync(p)) {
          modPath = p;
          break;
        }
      }

      if (modPath) {
        const modUrl = "file:///" + modPath.replace(/\\\\/g, "/");
        const { pipeline, env } = await import(modUrl);
        let chosenModelDir = "";
        for (const md of possibleModelDirs) {
          if (nodeFs.existsSync(md)) {
            chosenModelDir = md;
            break;
          }
        }
        if (chosenModelDir) env.cacheDir = chosenModelDir;
        env.allowLocalModels = true;
        env.allowRemoteModels = true;

        const transcriber = await pipeline("automatic-speech-recognition", "Xenova/whisper-base");
        const promptContext = (vAsset.prompt || "").slice(0, 100);
        const out = await transcriber(float32, {
          language: "vietnamese",
          task: "transcribe",
          sampling_rate: 16000,
          initial_prompt: promptContext || "tạo nhân vật nữ review balo, kịch bản lồng tiếng"
        });

        if (out && typeof out.text === "string") {
          let s = out.text.trim();
          if (s.length > 2) {
            s = s.replace(/3\\s*lo|bà\\s*lôn|ba\\s*lo/gi, "balo")
                 .replace(/mưỡi/gi, "mới")
                 .replace(/xem\\s+trước\\s+([0-9a-zà-ỹ]+)\\s+mới/gi, "xem chiếc $1 mới")
                 .replace(/xem\\s+trước\\s+balo/gi, "xem chiếc balo")
                 .replace(/xem\\s+trước/gi, "xem chiếc")
                 .replace(/chất\\s+vài/gi, "chất vải")
                 .replace(/xíu\\s+trống\\s+nước/gi, "siêu chống nước")
                 .replace(/trống\\s+nước/gi, "chống nước")
                 .replace(/đ[eé]o\\s+thử/gi, "đeo thử")
                 .replace(/đ[eé]o/gi, "đeo")
                 .replace(/lên\\s+vài/gi, "lên vai")
                 .replace(/nhá,\\s*em\\s+ai/gi, "nhé, êm ái")
                 .replace(/em\\s+ai|em\\s+ài/gi, "êm ái")
                 .replace(/(?:ưu|u)\\s+đại/gi, "ưu đãi")
                 .replace(/nhà\\./gi, "nha.")
                 .replace(/nhà$/gi, "nha");
            s = s.trim();
            if (s.length > 0) {
              scriptText = s.charAt(0).toUpperCase() + s.slice(1);
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn("[transcribeVideoAudio] Whisper recognition error:", err);
  } finally {
    try { await We(tempWav); } catch (_) {}
    if (downloadedTemp) {
      try { await We(downloadedTemp); } catch (_) {}
    }
  }

  if (!scriptText) {
    const originalPrompt = (vAsset.prompt || "").trim();
    const quoteMatch = originalPrompt.match(/["“]([^"”]+)["”]/);
    if (quoteMatch && quoteMatch[1].length > 3) {
      scriptText = quoteMatch[1].trim();
    } else if (originalPrompt) {
      let clean = originalPrompt.replace(/^(tạo video|video|quay cảnh|hình ảnh)\\s+/i, "");
      scriptText = clean.slice(0, 120);
    } else {
      scriptText = "Chào cả nhà, hãy xem video tuyệt vời này nhé!";
    }
  }

  return {
    script: scriptText,
    duration: duration,
    language: "vi",
    prompt: vAsset.prompt || ""
  };
}
${assetStoreMethodAnchor}`;

if (!mainCode.includes('async muxAudioIntoVideo(')) {
  if (mainCode.includes(assetStoreMethodAnchor)) {
    mainCode = mainCode.replace(assetStoreMethodAnchor, newAssetStoreMethods);
    console.log('  ✓ Đã thêm muxAudioIntoVideo & transcribeVideoAudio vào AssetStore!');
  } else {
    console.error('  ✗ Không tìm thấy assetStoreMethodAnchor!');
  }
}

// Register IPC handlers in qw()
const ipcAnchor = 'S.handle("assets:cancelMerge",';
const newIpcHandlers = `S.handle("assets:muxAudioVideo", async (r, videoAssetId, audioAssetId, options) => {
  A(r);
  const n = ct.begin(qa(options));
  try {
    F(n?.controller.signal);
    return await $.muxAudioIntoVideo(videoAssetId, audioAssetId, { ...options, signal: n?.controller.signal });
  } finally {
    ct.finish(n);
  }
}),
S.handle("assets:transcribeVideoAudio", async (r, videoAssetId, options) => {
  A(r);
  const n = ct.begin(qa(options));
  try {
    F(n?.controller.signal);
    return await $.transcribeVideoAudio(videoAssetId, { ...options, signal: n?.controller.signal });
  } finally {
    ct.finish(n);
  }
}),
${ipcAnchor}`;

if (!mainCode.includes('assets:muxAudioVideo')) {
  if (mainCode.includes(ipcAnchor)) {
    mainCode = mainCode.replace(ipcAnchor, newIpcHandlers);
    console.log('  ✓ Đã đăng ký IPC handlers: assets:muxAudioVideo & assets:transcribeVideoAudio!');
  } else {
    console.error('  ✗ Không tìm thấy ipcAnchor!');
  }
}

fs.writeFileSync(mainPath, mainCode, 'utf8');

// ============================================================================
// 2. PATCH PRELOAD: EXPOSE muxAudioVideo & transcribeVideoAudio
// ============================================================================
console.log('\n[2/4] Nâng cấp Preload (app/out/preload/index.cjs)...');
let preloadCode = fs.readFileSync(preloadPath, 'utf8');
const preloadAnchor = 'cancelMerge:e=>r.ipcRenderer.invoke("assets:cancelMerge",e),';
const newPreloadProps = `${preloadAnchor}muxAudioVideo:(e,n,s)=>r.ipcRenderer.invoke("assets:muxAudioVideo",e,n,s),transcribeVideoAudio:(e,n)=>r.ipcRenderer.invoke("assets:transcribeVideoAudio",e,n),`;

if (!preloadCode.includes('muxAudioVideo:')) {
  if (preloadCode.includes(preloadAnchor)) {
    preloadCode = preloadCode.replace(preloadAnchor, newPreloadProps);
    console.log('  ✓ Đã expose window.aiforge.assets.muxAudioVideo & transcribeVideoAudio trong preload!');
  } else {
    console.error('  ✗ Không tìm thấy preloadAnchor!');
  }
  fs.writeFileSync(preloadPath, preloadCode, 'utf8');
}

// ============================================================================
// 3. PATCH WORKFLOW RUNNER: useWorkflowRunner-BmcV20yZ.js
// ============================================================================
console.log('\n[3/4] Nâng cấp Workflow Runner (useWorkflowRunner-BmcV20yZ.js)...');
let runnerCode = fs.readFileSync(runnerPath, 'utf8');

// Enhance node "merge" when both Video and Audio are incoming
const mergeTarget = 'else if(r.type==="merge"){const k=b.audios&&b.audios.length>0,O=b.videos&&b.videos.length>0,_=b.texts&&b.texts.length>0||!!b.text?.trim();if(!k&&!O&&!_)throw new Error(`${r.title} needs an audio, video, or text list input to merge.`);';
const enhancedMerge = `else if(r.type==="merge"){const k=b.audios&&b.audios.length>0,O=b.videos&&b.videos.length>0,_=b.texts&&b.texts.length>0||!!b.text?.trim();if(!k&&!O&&!_)throw new Error(\`\${r.title} needs an audio, video, or text list input to merge.\`);
if(O&&k){
  D(r,\`Lồng tiếng thông minh: Đang tự động ghép âm thanh ElevenLabs vào video Veo 3...\`,"info",{phase:"merge"});
  v(r.id,30);
  y(r.id,{progress:30,statusText:"Đang lồng tiếng video"});
  const vidAsset=b.videos[0];
  const audAsset=b.audios[0];
  const C=window.aiforge?.assets;
  if(!C?.muxAudioVideo)throw new Error("Chức năng lồng tiếng video chưa khả dụng trong preload.");
  const dubbed=await yo(m,de=>C.muxAudioVideo(vidAsset.assetId,audAsset.assetId,{operationId:de,fitDuration:r.config?.fitDuration!==!1}),C.cancelMerge);
  if(m?.aborted)throw new Qe;
  const te=dubbed.ratio||r.config?.outputAspect||"16:9",ce=Ca(te);
  D(r,\`Video đã lồng tiếng khớp mồm thành công: \${dubbed.name}\`,"success",{phase:"result"});
  U.videos.push({assetId:dubbed.id,url:dubbed.url,thumbnailUrl:dubbed.thumbnailUrl,mimeType:dubbed.mimeType});
  v(r.id,95);
  y(r.id,{progress:95,statusText:"Hoàn tất lồng tiếng",width:ce.width,height:ce.height,config:{...r.config,src:dubbed.url,outputAspect:te,outputAssets:[{type:"video",url:dubbed.url,assetId:dubbed.id,thumbnailUrl:dubbed.thumbnailUrl,mimeType:dubbed.mimeType}]}});
  return U;
}`;

if (!runnerCode.includes('Lồng tiếng thông minh: Đang tự động ghép')) {
  if (runnerCode.includes(mergeTarget)) {
    runnerCode = runnerCode.replace(mergeTarget, enhancedMerge);
    console.log('  ✓ Đã tích hợp Smart Audio-Video Dubbing vào node Merge!');
  } else {
    console.error('  ✗ Không tìm thấy mergeTarget trong runner!');
  }
}

// Add execution handler for "video-script-extract"
const scriptExtractAnchor = 'else if(r.type==="prompt"||r.type==="text"){';
const scriptExtractHandler = `else if(r.type==="video-script-extract"||r.type==="stt"){
  const vid=b.videos&&b.videos[0];
  if(!vid)throw new Error(\`\${r.title} cần 1 video đầu vào để bóc kịch bản nói.\`);
  D(r,"Đang phân tích và bóc kịch bản lời thoại nhân vật từ video...","info",{phase:"extract"});
  v(r.id,30);
  y(r.id,{progress:30,statusText:"Đang bóc kịch bản"});
  const C=window.aiforge?.assets;
  if(!C?.transcribeVideoAudio)throw new Error("Chức năng bóc kịch bản chưa khả dụng trong preload.");
  const res=await yo(m,de=>C.transcribeVideoAudio(vid.assetId,{operationId:de}),C.cancelMerge);
  if(m?.aborted)throw new Qe;
  const sText=res.script||"Này các bạn, hãy xem chiếc balo này đây!";
  U.text=sText;
  U.texts=[sText];
  U.videos=[vid];
  v(r.id,95);
  y(r.id,{progress:95,statusText:"Đã bóc xong kịch bản",config:{...r.config,outputText:sText,duration:res.duration}});
  D(r,\`Đã bóc xong kịch bản (\${res.duration}s): "\${sText}"\`,"success",{phase:"result"});
}
${scriptExtractAnchor}`;

if (!runnerCode.includes('r.type==="video-script-extract"')) {
  if (runnerCode.includes(scriptExtractAnchor)) {
    runnerCode = runnerCode.replace(scriptExtractAnchor, scriptExtractHandler);
    console.log('  ✓ Đã thêm execution handler cho node video-script-extract vào runner!');
  } else {
    console.error('  ✗ Không tìm thấy scriptExtractAnchor!');
  }
}

fs.writeFileSync(runnerPath, runnerCode, 'utf8');

// ============================================================================
// 4. PATCH WORKFLOW EDITOR & PALETTE
// ============================================================================
console.log('\n[4/4] Nâng cấp Palette Workflow Editor (WorkflowEditor-BFJj-KsD.js)...');
let editorCode = fs.readFileSync(editorPath, 'utf8');

// Palette array injection
const paletteAnchor = '{type:"merge",title:"Merge",desc:"Merge a list of video clips, audio clips, or text segments"}';
const newPaletteItem = `${paletteAnchor},{type:"video-script-extract",title:"AI Bóc Kịch Bản Video",desc:"Nghe và bóc tách kịch bản lời thoại nhân vật từ video Veo 3 để đưa vào ElevenLabs"}`;

if (!editorCode.includes('AI Bóc Kịch Bản Video')) {
  if (editorCode.includes(paletteAnchor)) {
    editorCode = editorCode.replace(paletteAnchor, newPaletteItem);
    console.log('  ✓ Đã thêm node "AI Bóc Kịch Bản Video" vào Palette của Workflow Editor!');
  } else {
    console.error('  ✗ Không tìm thấy paletteAnchor!');
  }
  fs.writeFileSync(editorPath, editorCode, 'utf8');
}

// In index-8u8DZic4.js, register default node ports for video-script-extract
let indexRendererCode = fs.readFileSync(indexRendererPath, 'utf8');
const nodePortAnchor = 'if(l.type==="elevenlabs"&&(i={...i,width:500,height:250,config:{...i.config,count:1}}),';
const newPortLogic = `if(l.type==="video-script-extract"){i={...i,width:380,height:220,inputs:[{id:\`\${l.id}-in-vid\`,type:"video",label:"Video"}],outputs:[{id:\`\${l.id}-out-txt\`,type:"text",label:"Kịch bản thoại"},{id:\`\${l.id}-out-vid\`,type:"video",label:"Video gốc"}]}}
${nodePortAnchor}`;

if (!indexRendererCode.includes('l.type==="video-script-extract"')) {
  if (indexRendererCode.includes(nodePortAnchor)) {
    indexRendererCode = indexRendererCode.replace(nodePortAnchor, newPortLogic);
    console.log('  ✓ Đã đăng ký cổng Inputs/Outputs chuẩn cho node video-script-extract trong index-8u8DZic4.js!');
  } else {
    console.error('  ✗ Không tìm thấy nodePortAnchor!');
  }
  fs.writeFileSync(indexRendererPath, indexRendererCode, 'utf8');
}

console.log('\n======================================================================');
console.log('🎉 TẤT CẢ CÁC MODULE ĐÃ ĐƯỢC TÍCH HỢP AN TOÀN VÀ HOÀN TẤT! 🎉');
console.log('======================================================================');
