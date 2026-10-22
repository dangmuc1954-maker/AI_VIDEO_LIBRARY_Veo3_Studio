const fs = require('fs');
const path = require('path');

console.log('=== NÂNG CẤP ENGINE LỒNG TIẾNG & ĐỒNG BỘ VIDEO VÀO MAIN PROCESS ===');

const targetRoots = [
  path.join(__dirname, '../app'),
  path.join('C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app')
];

const newSyncVoiceoverMethod = `async syncVoiceoverVideo(videoAssetId, audioAssetId, options = {}) {
  const { signal: n } = options;
  if (n?.aborted) throw new Error("Thao tác lồng tiếng đã bị hủy");

  const fs = nodeFs;
  const fsp = nodeFs.promises;
  const path = nodePath;

  // 1. Tìm asset video và audio từ DB
  const cleanVidId = typeof videoAssetId === "string" ? videoAssetId.replace(/^.*\\/asset\\//, "").replace(/\\?.*$/, "").trim() : "";
  let vAsset = cleanVidId ? this.getAsset(cleanVidId) : null;
  if (!vAsset && videoAssetId) vAsset = this.getAsset(videoAssetId);

  const cleanAudId = typeof audioAssetId === "string" ? audioAssetId.replace(/^.*\\/asset\\//, "").replace(/\\?.*$/, "").trim() : "";
  let aAsset = cleanAudId ? this.getAsset(cleanAudId) : null;
  if (!aAsset && audioAssetId) aAsset = this.getAsset(audioAssetId);

  // Đảo chiều nếu cắm ngược video và audio
  if (vAsset && aAsset) {
    if (vAsset.type === "audio" && aAsset.type === "video") {
      const tmp = vAsset;
      vAsset = aAsset;
      aAsset = tmp;
    }
  }

  // Fallback an toàn: Tìm các asset thực sự tồn tại trên ổ đĩa
  if (!vAsset && this.state.assets.length > 0) {
    const validVideos = this.state.assets.filter(a => a.type === "video" && a.localPath && fs.existsSync(a.localPath));
    if (validVideos.length > 0) vAsset = validVideos[validVideos.length - 1];
  }
  if (!aAsset && this.state.assets.length > 0) {
    const validAudios = this.state.assets.filter(a => a.type === "audio" && a.localPath && fs.existsSync(a.localPath));
    if (validAudios.length > 0) aAsset = validAudios[validAudios.length - 1];
  }

  if (!vAsset) throw new Error("Không tìm thấy video đầu vào hợp lệ. Vui lòng kết nối node Veo 3 hoặc tải video lên!");
  if (!aAsset) throw new Error("Không tìm thấy file voice ElevenLabs hợp lệ. Vui lòng kết nối node ElevenLabs!");

  // Phục hồi video nếu localPath bị mất
  if (!fs.existsSync(vAsset.localPath)) {
    if (vAsset.url && (vAsset.url.startsWith("http") || vAsset.url.startsWith("data:"))) {
      await fsp.mkdir(this.filesDir, { recursive: true });
      const recoveredVid = path.join(this.filesDir, "recovered_vid_" + nodeCrypto.randomUUID() + ".mp4");
      const resp = await fetch(vAsset.remoteUrl || vAsset.url);
      const buf = Buffer.from(await resp.arrayBuffer());
      await fsp.writeFile(recoveredVid, buf);
      vAsset.localPath = recoveredVid;
    } else {
      // Thử tìm file video khác có thật
      const fallbackVid = this.state.assets.find(a => a.type === "video" && a.localPath && fs.existsSync(a.localPath));
      if (fallbackVid) vAsset = fallbackVid;
      else throw new Error("File video gốc không tồn tại trên ổ đĩa: " + vAsset.localPath);
    }
  }

  // Phục hồi audio nếu localPath bị mất
  if (!fs.existsSync(aAsset.localPath)) {
    if (aAsset.url && (aAsset.url.startsWith("http") || aAsset.url.startsWith("data:"))) {
      await fsp.mkdir(this.filesDir, { recursive: true });
      const recoveredAud = path.join(this.filesDir, "recovered_aud_" + nodeCrypto.randomUUID() + ".mp3");
      const resp = await fetch(aAsset.remoteUrl || aAsset.url);
      const buf = Buffer.from(await resp.arrayBuffer());
      await fsp.writeFile(recoveredAud, buf);
      aAsset.localPath = recoveredAud;
    } else {
      // Thử tìm file audio khác có thật
      const fallbackAud = this.state.assets.find(a => a.type === "audio" && a.localPath && fs.existsSync(a.localPath));
      if (fallbackAud) aAsset = fallbackAud;
      else throw new Error("File giọng ElevenLabs không tồn tại trên ổ đĩa: " + aAsset.localPath);
    }
  }

  let ffmpegBin = "ffmpeg";
  try { ffmpegBin = await Do(n); } catch (_) {}

  // 2. Phân tích thời lượng & thông số video và audio
  const probeMedia = (filePath) => new Promise((resolve) => {
    nodeCp.execFile(ffmpegBin, ["-hide_banner", "-i", filePath], (err, stdout, stderr) => {
      const out = (stderr || "") + (stdout || "");
      let dur = 5.0;
      let hasAudio = false;
      let width = 1280;
      let height = 720;

      const durM = out.match(/Duration:\\s*(\\d{2}):(\\d{2}):(\\d{2}(?:\\.\\d+)?)/);
      if (durM) {
        dur = Math.max(0.1, Number(durM[1]) * 3600 + Number(durM[2]) * 60 + Number(durM[3]));
      }
      if (out.includes("Audio:")) hasAudio = true;
      const resM = out.match(/Stream.*Video:.*,\\s*(\\d{2,5})x(\\d{2,5})/);
      if (resM) {
        width = parseInt(resM[1], 10);
        height = parseInt(resM[2], 10);
      }
      resolve({ duration: dur, hasAudio, width, height });
    });
  });

  const [vInfo, aInfo] = await Promise.all([
    probeMedia(vAsset.localPath),
    probeMedia(aAsset.localPath)
  ]);

  const vDur = Math.max(0.1, vInfo.duration || 5.0);
  const aDur = Math.max(0.1, aInfo.duration || 5.0);

  await fsp.mkdir(this.filesDir, { recursive: true });
  const randomSuffix = nodeCrypto.randomUUID();
  const tempOut = path.join(this.filesDir, "dubbed_sync_" + randomSuffix + ".mp4");

  try {
    // 3. Tính toán Co giãn nhịp điệu (Time-Stretching) khớp với Video
    let targetSpeed = 1.0;
    if (options.speedMode === "custom" && typeof options.customSpeed === "number") {
      targetSpeed = Math.max(0.5, Math.min(2.0, options.customSpeed));
    } else if (options.speedMode === "keep_original") {
      targetSpeed = 1.0;
    } else {
      // Auto-Fit: Tự động điều chỉnh tốc độ nói của ElevenLabs để khớp trọn vẹn thời lượng video
      targetSpeed = aDur / vDur;
      targetSpeed = Math.max(0.65, Math.min(1.65, targetSpeed));
      if (Math.abs(targetSpeed - 1.0) < 0.04) targetSpeed = 1.0;
    }

    const voiceFilters = [];
    // Áp dụng bộ lọc co giãn thời gian bảo toàn cao độ
    if (Math.abs(targetSpeed - 1.0) >= 0.04) {
      if (targetSpeed > 2.0) {
        voiceFilters.push("atempo=2.0,atempo=" + (targetSpeed / 2.0).toFixed(3));
      } else if (targetSpeed < 0.5) {
        voiceFilters.push("atempo=0.5,atempo=" + (targetSpeed / 0.5).toFixed(3));
      } else {
        voiceFilters.push("atempo=" + targetSpeed.toFixed(3));
      }
    }

    // 4. Tinh chỉnh âm sắc & ngữ điệu nhân vật (Mood Presets)
    const mood = options.mood || "viral_climax";
    voiceFilters.push("highpass=f=75"); // Khử tạp âm tần số siêu trầm

    if (mood === "viral_climax") {
      // Sôi nổi, cuốn hút, dội âm ấm và nén mạnh chuẩn TikTok/Shorts
      voiceFilters.push("bass=g=3.2:f=120");
      voiceFilters.push("treble=g=3.0:f=3800");
      voiceFilters.push("acompressor=threshold=-18dB:ratio=4.0:attack=12:release=110");
      voiceFilters.push("loudnorm=I=-14:LRA=8:TP=-1.0");
    } else if (mood === "dramatic") {
      // Điện ảnh, kịch tính, dải động sâu
      voiceFilters.push("bass=g=2.5:f=140");
      voiceFilters.push("treble=g=2.0:f=4500");
      voiceFilters.push("acompressor=threshold=-22dB:ratio=3.0:attack=20:release=150");
      voiceFilters.push("loudnorm=I=-16:LRA=11:TP=-1.5");
    } else if (mood === "broadcast") {
      // Chuẩn phòng thu, phát thanh truyền cảm, rõ nét
      voiceFilters.push("equalizer=f=180:t=q:w=1:g=2.2");
      voiceFilters.push("equalizer=f=3200:t=q:w=1:g=2.8");
      voiceFilters.push("acompressor=threshold=-20dB:ratio=3.0:attack=15:release=120");
      voiceFilters.push("loudnorm=I=-16:LRA=9:TP=-1.5");
    } else if (mood === "sales_punch") {
      // Bán hàng năng lượng cao, giọng nảy và dứt khoát
      voiceFilters.push("volume=1.15");
      voiceFilters.push("treble=g=3.5:f=3500");
      voiceFilters.push("acompressor=threshold=-15dB:ratio=4.5:attack=8:release=90");
      voiceFilters.push("loudnorm=I=-13:LRA=7:TP=-1.0");
    } else {
      // Tự nhiên (giữ nguyên chất giọng ElevenLabs mộc)
      voiceFilters.push("loudnorm=I=-16:LRA=10:TP=-1.5");
    }

    const userVol = typeof options.voiceVolume === "number" ? Math.max(10, Math.min(250, options.voiceVolume)) / 100 : 1.0;
    if (Math.abs(userVol - 1.0) > 0.05) {
      voiceFilters.push("volume=" + userVol.toFixed(2));
    }

    voiceFilters.push("aresample=48000,aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo");
    const voiceChain = voiceFilters.join(",");

    // 5. Hòa âm lồng tiếng (Smart Audio Mixing & Ducking)
    const removeOrig = options.removeOriginalAudio !== false && options.keepBackgroundMusic !== true;
    const filterComplex = [];
    filterComplex.push("[1:a]" + voiceChain + "[voice]");

    const ffmpegArgs = ["-hide_banner", "-loglevel", "error", "-y", "-i", vAsset.localPath, "-i", aAsset.localPath];

    if (removeOrig || !vInfo.hasAudio) {
      // Chế độ 1: Xóa âm thanh gốc hoặc video không có âm thanh gốc
      filterComplex.push("[voice]apad=pad_dur=" + vDur.toFixed(2) + "[outa]");
      ffmpegArgs.push("-filter_complex", filterComplex.join(";"), "-map", "0:v:0", "-map", "[outa]");
    } else {
      // Chế độ 2: Giữ nhạc nền video gốc với Audio Ducking thông minh
      const bgmVol = typeof options.bgmVolume === "number" ? (options.bgmVolume / 100).toFixed(2) : "0.18";
      filterComplex.push("[0:a]volume=" + bgmVol + "[bgm]");
      filterComplex.push("[bgm][voice]amix=inputs=2:duration=first:dropout_transition=2[outa]");
      ffmpegArgs.push("-filter_complex", filterComplex.join(";"), "-map", "0:v:0", "-map", "[outa]");
    }

    ffmpegArgs.push("-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-shortest", "-movflags", "+faststart", tempOut);

    await new Promise((resolve, reject) => {
      nodeCp.execFile(ffmpegBin, ffmpegArgs, (err, stdout, stderr) => {
        if (err) return reject(new Error("Lỗi ffmpeg: " + (stderr || err.message)));
        resolve();
      });
    });

    if (!fs.existsSync(tempOut)) throw new Error("FFmpeg không tạo được file video lồng tiếng đầu ra.");

    const bytes = await fsp.readFile(tempOut);
    const finalName = (options.name && options.name.trim()) || ("Dubbed_" + (vAsset.name || Date.now() + ".mp4"));

    const newAsset = await this.writeAsset({
      id: nodeCrypto.randomUUID(),
      name: finalName,
      type: "video",
      role: "generated",
      mimeType: "video/mp4",
      bytes: bytes,
      ratio: vInfo.width && vInfo.height ? (vInfo.width >= vInfo.height ? "16:9" : "9:16") : "16:9",
      createdAt: new Date().toISOString()
    }, { signal: n });

    return newAsset;
  } finally {
    try { if (fs.existsSync(tempOut)) await fsp.unlink(tempOut); } catch (_) {}
  }
}`;

for (const root of targetRoots) {
  if (!fs.existsSync(root)) continue;
  const mainPath = path.join(root, 'out/main/index.js');
  if (!fs.existsSync(mainPath)) continue;

  console.log('[*] Đang cập nhật:', mainPath);
  let code = fs.readFileSync(mainPath, 'utf8');

  const methodStart = code.indexOf('async syncVoiceoverVideo(');
  if (methodStart !== -1) {
    // Tìm điểm kết thúc của phương thức hiện tại (trước async muxAudioIntoVideo)
    const nextMethod = code.indexOf('async muxAudioIntoVideo', methodStart);
    if (nextMethod !== -1) {
      code = code.substring(0, methodStart) + newSyncVoiceoverMethod + '\n' + code.substring(nextMethod);
      fs.writeFileSync(mainPath, code, 'utf8');
      console.log('  ✓ Đã cập nhật syncVoiceoverVideo mới chuẩn xác!');
    }
  }
}
