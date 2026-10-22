const fs = require('fs');
const path = require('path');

const mainPath = path.join(__dirname, '../app/out/main/index.js');
let content = fs.readFileSync(mainPath, 'utf8');

const sIdx = content.indexOf('async syncVoiceoverVideo(');
const eIdx = content.indexOf('async editAndMergeVideos(');

if (sIdx === -1 || eIdx === -1) {
  console.error('❌ Không tìm thấy vị trí bắt đầu hoặc kết thúc trong app/out/main/index.js!');
  process.exit(1);
}

const newCustomBlock = `async syncVoiceoverVideo(videoAssetId, audioAssetId, options = {}) {
  const { signal: n } = options;
  if (n?.aborted) throw new Error("Thao tác lồng tiếng đã bị hủy");
  const nodeFs = require("node:fs");
  const nodePath = require("node:path");
  const nodeCp = require("node:child_process");
  const nodeCrypto = require("node:crypto");

  const cleanVidId = typeof videoAssetId === "string" ? videoAssetId.replace(/^.*\\/asset\\//, "").replace(/\\?.*$/, "").trim() : "";
  let vAsset = cleanVidId ? this.getAsset(cleanVidId) : null;
  if (!vAsset && videoAssetId) vAsset = this.getAsset(videoAssetId);

  const cleanAudId = typeof audioAssetId === "string" ? audioAssetId.replace(/^.*\\/asset\\//, "").replace(/\\?.*$/, "").trim() : "";
  let aAsset = cleanAudId ? this.getAsset(cleanAudId) : null;
  if (!aAsset && audioAssetId) aAsset = this.getAsset(audioAssetId);

  if (vAsset && aAsset) {
    if (vAsset.type === "audio" && aAsset.type === "video") {
      const tmp = vAsset;
      vAsset = aAsset;
      aAsset = tmp;
    }
  }

  if (!vAsset && this.state.assets.length > 0) {
    vAsset = this.state.assets.filter(a => a.type === "video").slice(-1)[0];
  }
  if (!aAsset && this.state.assets.length > 0) {
    aAsset = this.state.assets.filter(a => a.type === "audio").slice(-1)[0];
  }

  if (!vAsset) throw new Error("Thiếu video đầu vào: " + videoAssetId);
  if (vAsset.type !== "video") throw new Error("Asset " + videoAssetId + " không phải là video");
  if (!aAsset) throw new Error("Thiếu audio giọng đọc ElevenLabs: " + audioAssetId);
  if (aAsset.type !== "audio") throw new Error("Asset " + audioAssetId + " không phải là audio");

  let ffmpegBin = "ffmpeg";
  try { ffmpegBin = await Do(n); } catch (_) {}

  // Lấy thời lượng video & audio
  const getDuration = (filePath) => new Promise((resolve) => {
    nodeCp.execFile(ffmpegBin, ["-hide_banner", "-i", filePath], (err, stdout, stderr) => {
      const output = (stderr || "") + (stdout || "");
      const m = output.match(/Duration:\\s*(\\d{2}):(\\d{2}):(\\d{2}(?:\\.\\d+)?)/);
      if (m) {
        resolve(Math.max(0.1, Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3])));
      } else {
        resolve(5.0);
      }
    });
  });

  const [vDur, aDur] = await Promise.all([
    getDuration(vAsset.localPath),
    getDuration(aAsset.localPath)
  ]);

  await nodeFs.promises.mkdir(this.filesDir, { recursive: true });
  const randomSuffix = nodeCrypto.randomUUID();
  const tempOut = nodePath.join(this.filesDir, "dubbed_sync_" + randomSuffix + ".mp4");

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
    if (mood === "viral_climax") {
      voiceFilters.push("bass=g=3:f=120,treble=g=2:f=4000,acompressor=threshold=-18dB:ratio=3.5:attack=15:release=120");
    } else if (mood === "broadcast") {
      voiceFilters.push("equalizer=f=180:t=q:w=1:g=2,equalizer=f=3200:t=q:w=1:g=2.5,alimiter=limit=-1dB");
    } else if (mood === "sales_punch") {
      voiceFilters.push("volume=1.2,treble=g=3:f=3500,acompressor=threshold=-15dB:ratio=4:attack=10:release=100");
    } else if (mood === "crisp") {
      voiceFilters.push("highpass=f=80,treble=g=4:f=5000,volume=1.05");
    }

    const userVol = typeof options.voiceVolume === "number" ? Math.max(10, Math.min(200, options.voiceVolume)) / 100 : 1.0;
    if (userVol !== 1.0) {
      voiceFilters.push("volume=" + userVol.toFixed(2));
    }

    const removeOrig = options.removeOriginalAudio !== false;
    const filterComplex = [];
    const voiceChain = voiceFilters.length > 0 ? voiceFilters.join(",") : "anull";
    filterComplex.push("[1:a]" + voiceChain + "[voice]");

    const ffmpegArgs = ["-hide_banner", "-loglevel", "error", "-y", "-i", vAsset.localPath, "-i", aAsset.localPath];

    if (removeOrig) {
      filterComplex.push("[voice]apad=pad_dur=" + vDur.toFixed(2) + "[outa]");
      ffmpegArgs.push("-filter_complex", filterComplex.join(";"), "-map", "0:v:0", "-map", "[outa]");
    } else {
      const origVol = typeof options.bgmVolume === "number" ? (options.bgmVolume / 100).toFixed(2) : "0.15";
      filterComplex.push("[0:a]volume=" + origVol + "[bgm]");
      filterComplex.push("[bgm][voice]amix=inputs=2:duration=first:dropout_transition=2[outa]");
      ffmpegArgs.push("-filter_complex", filterComplex.join(";"), "-map", "0:v:0", "-map", "[outa]");
    }

    ffmpegArgs.push("-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", tempOut);

    await new Promise((resolve, reject) => {
      const proc = nodeCp.execFile(ffmpegBin, ffmpegArgs, { timeout: 180000 }, (err) => {
        if (err) return reject(err);
        resolve();
      });
      if (n) n.addEventListener("abort", () => proc.kill(), { once: true });
    });

    const outBytes = await nodeFs.promises.readFile(tempOut);
    const createdAsset = await this.writeAsset({
      id: nodeCrypto.randomUUID(),
      name: options.name || ("Video_Dubbed_" + Date.now() + ".mp4"),
      type: "video",
      role: "generated",
      mimeType: "video/mp4",
      bytes: outBytes,
      createdAt: new Date().toISOString()
    }, { signal: n });

    return createdAsset;
  } finally {
    try { if (nodeFs.existsSync(tempOut)) await nodeFs.promises.unlink(tempOut); } catch (_) {}
  }
}

async muxAudioIntoVideo(videoAssetId, audioAssetId, options = {}) {
  const { signal: n } = options;
  if (n?.aborted) throw new Error("Thao tác ghép audio đã bị hủy");
  const nodeFs = require("node:fs");
  const nodePath = require("node:path");
  const nodeCp = require("node:child_process");
  const nodeCrypto = require("node:crypto");

  const cleanVidId = String(videoAssetId || "").replace(/^.*\\/asset\\//, "").replace(/\\?.*$/, "").trim();
  const vAsset = this.getAsset(cleanVidId) || this.state.assets.find(t => t.id === cleanVidId || t.id === videoAssetId);
  if (!vAsset) throw new Error("Missing video asset " + videoAssetId);

  const cleanAudId = String(audioAssetId || "").replace(/^.*\\/asset\\//, "").replace(/\\?.*$/, "").trim();
  const aAsset = this.getAsset(cleanAudId) || this.state.assets.find(t => t.id === cleanAudId || t.id === audioAssetId);
  if (!aAsset) throw new Error("Missing audio asset " + audioAssetId);

  let ffmpegBin = "ffmpeg";
  try { ffmpegBin = await Do(n); } catch (_) {}

  await nodeFs.promises.mkdir(this.filesDir, { recursive: true });
  const tempMux = nodePath.join(this.filesDir, "mux_" + nodeCrypto.randomUUID() + ".mp4");

  try {
    const args = ["-hide_banner", "-loglevel", "error", "-y", "-i", vAsset.localPath, "-i", aAsset.localPath, "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-map", "0:v:0", "-map", "1:a:0", "-shortest", tempMux];
    await new Promise((resolve, reject) => {
      const proc = nodeCp.execFile(ffmpegBin, args, { timeout: 180000 }, (err) => {
        if (err) return reject(err);
        resolve();
      });
      if (n) n.addEventListener("abort", () => proc.kill(), { once: true });
    });

    const outBytes = await nodeFs.promises.readFile(tempMux);
    return await this.writeAsset({
      id: nodeCrypto.randomUUID(),
      name: options.name || ("Muxed_" + Date.now() + ".mp4"),
      type: "video",
      role: "generated",
      mimeType: "video/mp4",
      bytes: outBytes,
      createdAt: new Date().toISOString()
    }, { signal: n });
  } finally {
    try { if (nodeFs.existsSync(tempMux)) await nodeFs.promises.unlink(tempMux); } catch (_) {}
  }
}

async transcribeVideoAudio(videoAssetId, options = {}) {
  const { signal: n } = options;
  if (n?.aborted) throw new Error("Thao tác bóc kịch bản đã bị hủy");
  const nodeFs = require("node:fs");
  const nodePath = require("node:path");
  const nodeCp = require("node:child_process");
  const nodeCrypto = require("node:crypto");
  const { pathToFileURL } = require("node:url");

  const cleanId = String(videoAssetId || "").replace(/^.*\\/asset\\//, "").replace(/\\?.*$/, "").trim();
  const vAsset = this.getAsset(cleanId) || this.state.assets.find(t => t.id === cleanId || t.id === videoAssetId || t.url === videoAssetId || t.providerAssetId === cleanId);
  if (!vAsset) throw new Error("Không tìm thấy video đầu vào: " + videoAssetId);
  if (vAsset.type !== "video") throw new Error("Asset " + videoAssetId + " không phải là file video");

  let ffmpegBin = "ffmpeg";
  try { ffmpegBin = await Do(n); } catch (_) {}

  let videoPath = vAsset.localPath;
  let downloadedTemp = null;
  if (!videoPath || !nodeFs.existsSync(videoPath)) {
    if (vAsset.remoteUrl || (typeof vAsset.url === "string" && vAsset.url.startsWith("http"))) {
      await nodeFs.promises.mkdir(this.filesDir, { recursive: true });
      downloadedTemp = nodePath.join(this.filesDir, "remote_vid_" + nodeCrypto.randomUUID() + ".mp4");
      const resp = await fetch(vAsset.remoteUrl || vAsset.url);
      const arr = Buffer.from(await resp.arrayBuffer());
      await nodeFs.promises.writeFile(downloadedTemp, arr);
      videoPath = downloadedTemp;
    } else {
      throw new Error("Không tìm thấy file video trên đĩa: " + (vAsset.localPath || vAsset.url));
    }
  }

  // Lấy thời lượng video
  const duration = await new Promise((resolve) => {
    nodeCp.execFile(ffmpegBin, ["-hide_banner", "-i", videoPath], (err, stdout, stderr) => {
      const output = (stderr || "") + (stdout || "");
      const m = output.match(/Duration:\\s*(\\d{2}):(\\d{2}):(\\d{2}(?:\\.\\d+)?)/);
      if (m) {
        resolve(Math.max(0.1, Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3])));
      } else {
        resolve(5.0);
      }
    });
  });

  await nodeFs.promises.mkdir(this.filesDir, { recursive: true });
  const tempWav = nodePath.join(this.filesDir, "stt_extract_" + nodeCrypto.randomUUID() + ".wav");
  let scriptText = "";

  try {
    const extractArgs = ["-hide_banner", "-loglevel", "error", "-y", "-i", videoPath, "-vn", "-ar", "16000", "-ac", "1", tempWav];
    await new Promise((resolve, reject) => {
      const proc = nodeCp.execFile(ffmpegBin, extractArgs, { timeout: 60000 }, (err) => {
        if (err) return reject(err);
        resolve();
      });
      if (n) n.addEventListener("abort", () => proc.kill(), { once: true });
    });

    if (nodeFs.existsSync(tempWav) && nodeFs.statSync(tempWav).size > 1000) {
      const wavBuf = await nodeFs.promises.readFile(tempWav);
      const pcmBytes = wavBuf.subarray(44);
      const float32 = new Float32Array(pcmBytes.length / 2);
      for (let i = 0; i < float32.length; i++) {
        float32[i] = pcmBytes.readInt16LE(i * 2) / 32768.0;
      }

      const possibleTransformers = [
        nodePath.join(__dirname, "../node_modules/@xenova/transformers/src/transformers.js"),
        nodePath.join(__dirname, "../../node_modules/@xenova/transformers/src/transformers.js"),
        nodePath.join(process.resourcesPath || "", "app/node_modules/@xenova/transformers/src/transformers.js"),
        "C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app/node_modules/@xenova/transformers/src/transformers.js",
        "D:/dự án antigravity/AIForge_Veo3_Studio/app/node_modules/@xenova/transformers/src/transformers.js"
      ];

      const possibleModelDirs = [
        nodePath.join(__dirname, "../models"),
        nodePath.join(__dirname, "../../models"),
        nodePath.join(process.env.APPDATA || "", "AI_VIDEO_LIBRARY_DATA/models"),
        nodePath.join(process.resourcesPath || "", "app/models"),
        "C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app/models",
        "D:/dự án antigravity/AIForge_Veo3_Studio/app/models"
      ];

      let modPath = possibleTransformers.find(p => nodeFs.existsSync(p));
      if (!modPath) {
        throw new Error("Không tìm thấy thư viện AI Speech Recognition (@xenova/transformers).");
      }

      const modUrl = pathToFileURL(modPath).href;
      const { pipeline, env } = await import(modUrl);
      let chosenModelDir = possibleModelDirs.find(md => nodeFs.existsSync(md));
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
          s = s.replace(/(?<![\\p{L}\\p{N}])cả\\s+nhà(?![\\p{L}\\p{N}])/giu, '__CA_NHA__');
          const rep = (pat, repl) => {
            const re = new RegExp("(?<![\\\\p{L}\\\\p{N}])" + pat + "(?![\\\\p{L}\\\\p{N}])", "giu");
            s = s.replace(re, repl);
          };

          // 1. Lời chào & mở đầu
          rep("(?:trong|chong|choang|cho|chúng)\\\\s+mình\\\\s+các\\\\s+bạn", "Chào mừng các bạn");
          rep("(?:trong|chong|choang|cho|chúng)\\\\s+mình\\\\s+mọi\\\\s+người", "Chào mừng mọi người");
          rep("xin\\\\s+chào\\\\s+các\\\\s+bạn\\\\s+đã\\\\s+quay\\\\s+trở\\\\s+lại", "Chào mừng các bạn đã quay trở lại");

          // 2. Chủ ngữ & danh từ sản phẩm
          rep("chia\\\\s+sẻ\\\\s+này", "chiếc xe này");
          rep("chia\\\\s+sẻ(?=\\\\s+(?:này|đạp|chạy|đi|có|rất|được))", "chiếc xe");
          rep("3\\\\s*lo|bà\\\\s*lôn|ba\\\\s*lo|balon|ban\\\\s+lo|ban\\\\s*lo", "balo");
          rep("xem\\\\s+trước\\\\s+([0-9a-zà-ỹ]+)\\\\s+mới", "xem chiếc $1 mới");
          rep("(?:xem|review|riview)\\\\s+trước\\\\s+([0-9a-zà-ỹ]+)", "review chiếc $1");
          rep("xem\\\\s+trước", "xem chiếc");
          rep("riview|reviu", "review");
          rep("chứt\\\\s+kế|chức\\\\s+kế|chất\\\\s+kế", "thiết kế");
          rep("khung\\\\s+sửa|khung\\\\s+sữa|khung\\\\s+sưa", "khung sườn");
          rep("các\\\\s+bòn|các\\\\s+bon|cacbon|khung\\\\s+các\\\\s+bòn", "carbon");
          rep("siêu\\\\s+bên", "siêu bền");
          rep("mưỡi|mỡi", "mới");
          rep("rút\\\\s+đổi\\\\s+trạy|rút\\\\s+đổi\\\\s+chạy", "tốc độ chạy");
          rep("rút\\\\s+đổi", "tốc độ");
          rep("trạy", "chạy");
          rep("chất\\\\s+vài|chất\\\\s+liệu\\\\s+vài", "chất liệu vải");
          rep("chúng\\\\s+nước|xíu\\\\s+trống\\\\s+nước|trống\\\\s+nước", "chống nước");
          rep("xíu(?=\\\\s+(?:chống|đẹp|nhẹ|bền|nhanh|mượt|êm))", "siêu");
          rep("đ[eé]o\\\\s+thử", "đeo thử");
          rep("đ[eé]o(?=\\\\s+(?:thử|lên|vào|chiếc|balo|tai|vai))", "đeo");
          rep("(?:lên|trên)\\\\s+vài", "lên vai");
          rep("em\\\\s+ai|em\\\\s+ài", "êm ái");
          rep("ưu\\\\s+đại|u\\\\s+đại", "ưu đãi");
          rep("linh\\\\s+mua\\\\s+hàng", "link mua hàng");
          rep("linh\\\\s+bên\\\\s+dưới", "link bên dưới");
          rep("dộng\\\\s+giải|rộng\\\\s+giải", "rộng rãi");
          rep("nhân\\\\s+viên\\\\s+vài", "nhân vật");
          rep("tai\\\\s+nghé", "tai nghe");
          rep("điện\\\\s+thoai", "điện thoại");
          rep("xe\\\\s+đập", "xe đạp");
          rep("kết\\\\s+l\\\\s*nối", "kết nối");
          rep("bảo\\\\s+hanh", "bảo hành");
          rep("khuyên\\\\s+mãi|khuyễn\\\\s+mãi", "khuyến mãi");
          rep("chính\\\\s+hang", "chính hãng");

          // 3. Lời kết
          rep("nhớ\\\\s+bấm\\\\s+follow\\\\s+mình\\\\s+nhá", "nhớ bấm follow mình nhé");
          rep("nhớ\\\\s+follow\\\\s+kênh\\\\s+để\\\\s+xem\\\\s+thêm\\\\s+nhá", "nhớ follow kênh để xem thêm nhé");
          rep("đăng\\\\s+kí", "đăng ký");
          rep("nhá(?=[,.!?]|$)", "nhé");
          rep("nhà(?=[,.!?]|$)", "nha");

          s = s.replace(/__CA_NHA__/g, "cả nhà");
          s = s.replace(/\\s+/g, " ").trim();
          s = s.replace(/([.?!])\\s*(\\p{L})/gu, (_, p1, p2) => p1 + " " + p2.toUpperCase());
          if (s.length > 0) {
            s = s.charAt(0).toUpperCase() + s.slice(1);
            if (!/[.!?]$/.test(s)) s += ".";
            scriptText = s;
          }
        }
      }
    }
  } catch (err) {
    console.error("[transcribeVideoAudio] Lỗi chi tiết Whisper:", err);
    throw new Error("Lỗi bóc kịch bản âm thanh: " + (err.message || String(err)));
  } finally {
    try { if (nodeFs.existsSync(tempWav)) await nodeFs.promises.unlink(tempWav); } catch (_) {}
    if (downloadedTemp) {
      try { if (nodeFs.existsSync(downloadedTemp)) await nodeFs.promises.unlink(downloadedTemp); } catch (_) {}
    }
  }

  if (!scriptText) {
    throw new Error("Không phát hiện được lời thoại trong âm thanh của video (video có thể câm hoặc không có tiếng nói rõ ràng).");
  }

  return {
    script: scriptText,
    duration: duration,
    language: "vi"
  };
}

`;

content = content.slice(0, sIdx) + newCustomBlock + content.slice(eIdx);
fs.writeFileSync(mainPath, content, 'utf8');
console.log('✓ Đã cập nhật thành công 3 hàm độc lập không phụ thuộc biến minified trong app/out/main/index.js!');
