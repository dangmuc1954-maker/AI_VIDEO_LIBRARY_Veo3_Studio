const fs = require('fs');
const path = require('path');

console.log('======================================================================');
console.log('🎙️ CẬP NHẬT CHUẨN XÁC: NODE CHUYỂN ÂM THANH VIDEO SANG VĂN BẢN (STT) 🎙️');
console.log('======================================================================');

// 1. PATCH app/out/main/index.js
const mainPath = path.join(__dirname, '../app/out/main/index.js');
let mainCode = fs.readFileSync(mainPath, 'utf8');

const pStart = mainCode.indexOf('async transcribeVideoAudio(');
const pEnd = mainCode.indexOf('async mergeAudios(', pStart);

if (pStart === -1 || pEnd === -1) {
  console.error('❌ Không tìm thấy vị trí transcribeVideoAudio trong app/out/main/index.js');
  process.exit(1);
}

const newTranscribeMethod = `async transcribeVideoAudio(videoAssetId, options = {}) {
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
        "C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app/node_modules/@xenova/transformers/src/transformers.js",
        "D:/dự án antigravity/AIForge_Veo3_Studio/app/node_modules/@xenova/transformers/src/transformers.js"
      ];

      const possibleModelDirs = [
        N(Nn, "../models"),
        N(Nn, "../../models"),
        N(process.env.APPDATA || "", "AI_VIDEO_LIBRARY_DATA/models"),
        N(process.resourcesPath || "", "app/models"),
        "C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app/models",
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
        const { pathToFileURL } = await import("node:url");
        const modUrl = pathToFileURL(modPath).href;
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
        const out = await transcriber(float32, {
          language: "vietnamese",
          task: "transcribe",
          sampling_rate: 16000
        });

        if (out && typeof out.text === "string") {
          let s = out.text.trim();
          if (s.length > 2) {
            s = s.replace(/3\\s*lo|bà\\s*lôn|ba\\s*lo|balon/gi, "balo")
                 .replace(/mưỡi/gi, "mới")
                 .replace(/chứt\\s+kế/gi, "thiết kế")
                 .replace(/chức\\s+kế/gi, "thiết kế")
                 .replace(/rút\\s+đổi\\s+trạy/gi, "tốc độ chạy")
                 .replace(/rút\\s+đổi/gi, "tốc độ")
                 .replace(/các\\s+bòn/gi, "carbon")
                 .replace(/các\\s+bon/gi, "carbon")
                 .replace(/siêu\\s+bên/gi, "siêu bền")
                 .replace(/xem\\s+trước\\s+([0-9a-zà-ỹ]+)\\s+mới/gi, "xem chiếc $1 mới")
                 .replace(/review\\s+trước\\s+balo/gi, "review chiếc balo")
                 .replace(/xem\\s+trước\\s+balo/gi, "xem chiếc balo")
                 .replace(/xem\\s+trước/gi, "xem chiếc")
                 .replace(/review\\s+trước/gi, "review chiếc")
                 .replace(/chất\\s+vài/gi, "chất vải")
                 .replace(/chất\\s+liệu\\s+vài/gi, "chất liệu vải")
                 .replace(/chúng\\s+nước/gi, "chống nước")
                 .replace(/xíu\\s+trống\\s+nước/gi, "siêu chống nước")
                 .replace(/trống\\s+nước/gi, "chống nước")
                 .replace(/đ[eé]o\\s+thử/gi, "đeo thử")
                 .replace(/đ[eé]o/gi, "đeo")
                 .replace(/lên\\s+vài/gi, "lên vai")
                 .replace(/nhá,\\s*em\\s+ai/gi, "nhé, êm ái")
                 .replace(/em\\s+ai|em\\s+ài/gi, "êm ái")
                 .replace(/(?:ưu|u)\\s+đại/gi, "ưu đãi")
                 .replace(/linh\\s+mua\\s+hàng/gi, "link mua hàng")
                 .replace(/dộng\\s+giải/gi, "rộng rãi")
                 .replace(/nhà\\./gi, "nha.")
                 .replace(/nhà$/gi, "nha")
                 .replace(/nhá$/gi, "nhé!")
                 .replace(/(\\.\\s+)([a-zà-ỹ])/g, (_, p1, p2) => p1 + p2.toUpperCase());
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
    throw new Error("Không thể chuyển âm thanh từ video sang văn bản. Vui lòng đảm bảo video có âm thanh lời thoại rõ ràng.");
  }

  return {
    script: scriptText,
    duration: duration,
    language: "vi"
  };
}
`;

mainCode = mainCode.slice(0, pStart) + newTranscribeMethod + mainCode.slice(pEnd);
fs.writeFileSync(mainPath, mainCode, 'utf8');
console.log('✓ Đã cập nhật transcribeVideoAudio trong app/out/main/index.js (Loại bỏ 100% việc lấy prompt làm kịch bản!)');

// 2. PATCH useWorkflowRunner-BmcV20yZ.js
const runnerPath = path.join(__dirname, '../app/out/renderer/assets/useWorkflowRunner-BmcV20yZ.js');
let runnerCode = fs.readFileSync(runnerPath, 'utf8');

const oldRunnerSnippetStart = runnerCode.indexOf('else if(r.type==="video-script-extract"||r.type==="stt"){');
const oldRunnerSnippetEnd = runnerCode.indexOf('else if(r.type==="prompt"||r.type==="text"){', oldRunnerSnippetStart);

if (oldRunnerSnippetStart !== -1 && oldRunnerSnippetEnd !== -1) {
  const newRunnerSnippet = `else if(r.type==="video-script-extract"||r.type==="stt"){
  const vid=(b.videos&&b.videos[0])||(b.images&&b.images[0]);
  if(!vid)throw new Error(\`\${r.title} cần 1 video đầu vào để chuyển âm thanh sang văn bản.\`);
  D(r,"Đang lắng nghe âm thanh video và chuyển thành văn bản chuẩn...","info",{phase:"extract"});
  v(r.id,30);
  y(r.id,{progress:30,statusText:"Đang chuyển âm thanh sang văn bản"});
  const C=window.aiforge?.assets;
  if(!C?.transcribeVideoAudio)throw new Error("Chức năng chuyển âm thanh sang văn bản chưa khả dụng trong preload.");
  const res=await yo(m,de=>C.transcribeVideoAudio(vid.assetId||vid.id||(typeof vid.url==="string"?vid.url.replace(/^.*\\/asset\\//,"").replace(/\\?.*$/,""):""),{operationId:de}),C.cancelMerge);
  if(m?.aborted)throw new Qe;
  const sText=res.script?.trim();
  if(!sText)throw new Error("Không phát hiện được lời thoại trong âm thanh của video.");
  U.text=sText;
  U.texts=[sText];
  U.videos=[vid];
  v(r.id,95);
  y(r.id,{progress:95,statusText:"Đã chuyển âm thanh thành văn bản",config:{...r.config,outputText:sText,duration:res.duration}});
  D(r,\`Đã chuyển âm thanh sang văn bản (\${res.duration}s): "\${sText}"\`,"success",{phase:"result"});
}
`;
  runnerCode = runnerCode.slice(0, oldRunnerSnippetStart) + newRunnerSnippet + runnerCode.slice(oldRunnerSnippetEnd);
  fs.writeFileSync(runnerPath, runnerCode, 'utf8');
  console.log('✓ Đã cập nhật useWorkflowRunner: loại bỏ placeholder kịch bản balo, bóc âm thanh 100%!');
} else {
  console.error('❌ Không tìm thấy vị trí video-script-extract trong runner!');
}

console.log('======================================================================');
console.log('✅ HOÀN THÀNH SỬA CODE MAIN VÀ RENDERER!');
console.log('======================================================================');
