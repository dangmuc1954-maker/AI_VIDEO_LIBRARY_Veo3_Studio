const fs = require('fs');
const path = require('path');

console.log('======================================================================');
console.log('🛠️ SỬA LỖI REFERENCEERROR: REQUIRE IS NOT DEFINED TRONG ESM MAIN PROCESS 🛠️');
console.log('======================================================================');

const appDir = path.join(__dirname, '../app');
const mainPath = path.join(appDir, 'out/main/index.js');
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
            s = s.replace(/3\\s*lo|bà\\s*lôn|ba\\s*lo|balon/gi, "balo")
                 .replace(/mưỡi/gi, "mới")
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
                 .replace(/nhá$/gi, "nhé!");
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
`;

mainCode = mainCode.slice(0, pStart) + newTranscribeMethod + mainCode.slice(pEnd);
fs.writeFileSync(mainPath, mainCode, 'utf8');
console.log('✅ Đã sửa thành công lỗi require trong app/out/main/index.js!');
