async syncVoiceoverVideo(videoAssetId, audioAssetId, options = {}) {
  const { signal: n } = options;
  F(n);
  const cleanVidId = typeof videoAssetId === "string" ? videoAssetId.replace(/^.*\/asset\//, "").replace(/\?.*$/, "").trim() : "";
  let vAsset = cleanVidId ? this.getAsset(cleanVidId) : null;
  if (!vAsset && videoAssetId) vAsset = this.getAsset(videoAssetId);

  const cleanAudId = typeof audioAssetId === "string" ? audioAssetId.replace(/^.*\/asset\//, "").replace(/\?.*$/, "").trim() : "";
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
    const durMatch = probeBuf.match(/Duration:\s*(\d{2}):(\d{2}):(\d{2}(?:\.\d+)?)/);
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
      voiceFilters.push(`equalizer=f=180:width_type=h:width=120:g=${(2.5 * intensity).toFixed(1)}`);
      voiceFilters.push(`equalizer=f=3600:width_type=h:width=1200:g=${(3.2 * intensity).toFixed(1)}`);
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
      args.push("-filter_complex", `[1:a]${voiceChain}[aout]`);
      args.push("-map", "0:v:0", "-map", "[aout]");
    } else {
      const bgmVol = typeof options.bgmVolume === "number" ? (options.bgmVolume / 100).toFixed(2) : "0.15";
      args.push("-filter_complex", `[0:a]volume=${bgmVol}[bgm];[1:a]${voiceChain}[voice];[bgm][voice]amix=inputs=2:duration=first:dropout_transition=2[aout]`);
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

async muxAudioIntoVideo(videoAssetId, audioAssetId, options = {}) {
  const { signal: n } = options;
  F(n);
  const cleanId = typeof videoAssetId === "string" ? videoAssetId.replace(/^.*\/asset\//, "").replace(/\?.*$/, "").trim() : "";
  let vAsset = cleanId ? this.getAsset(cleanId) : null;
  if (!vAsset && videoAssetId) {
    vAsset = this.getAsset(videoAssetId);
  }
  if (!vAsset && this.state.assets.length > 0) {
    vAsset = this.state.assets.filter(a => a.type === "video").slice(-1)[0] || this.state.assets.slice(-1)[0];
  }
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
  const cleanId = String(videoAssetId || "").replace(/^.*\/asset\//, "").replace(/\?.*$/, "").trim();
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
            // Protect idioms like "cả nhà" from ending particle "nha"
            s = s.replace(/(?<![\p{L}\p{N}])cả\s+nhà(?![\p{L}\p{N}])/giu, '__CA_NHA__');

            const rep = (pat, repl) => {
              const re = new RegExp("(?<![\\p{L}\\p{N}])" + pat + "(?![\\p{L}\\p{N}])", "giu");
              s = s.replace(re, repl);
            };

            // 1. Lời chào mở đầu (Greetings)
            rep("(?:trong|chong|choang|cho|chúng)\\s+mình\\s+các\\s+bạn", "Chào mừng các bạn");
            rep("(?:trong|chong|choang|cho|chúng)\\s+mình\\s+mọi\\s+người", "Chào mừng mọi người");
            rep("xin\\s+chào\\s+các\\s+bạn\\s+đã\\s+quay\\s+trở\\s+lại", "Chào mừng các bạn đã quay trở lại");

            // 2. Chủ ngữ & Đối tượng (Subjects & Product Names)
            rep("chia\\s+sẻ\\s+này", "chiếc xe này");
            rep("chia\\s+sẻ(?=\\s+(?:này|đạp|chạy|đi|có|rất|được))", "chiếc xe");
            rep("3\\s*lo|bà\\s*lôn|ba\\s*lo|balon", "balo");
            rep("xem\\s+trước\\s+([0-9a-zà-ỹ]+)\\s+mới", "xem chiếc $1 mới");
            rep("(?:xem|review|riview)\\s+trước\\s+([0-9a-zà-ỹ]+)", "review chiếc $1");
            rep("xem\\s+trước", "xem chiếc");
            rep("riview|reviu", "review");
            rep("chứt\\s+kế|chức\\s+kế|chất\\s+kế", "thiết kế");
            rep("khung\\s+sửa|khung\\s+sữa|khung\\s+sưa", "khung sườn");
            rep("các\\s+bòn|các\\s+bon|cacbon|khung\\s+các\\s+bòn", "carbon");
            rep("siêu\\s+bên", "siêu bền");
            rep("mưỡi|mỡi", "mới");
            rep("rút\\s+đổi\\s+trạy|rút\\s+đổi\\s+chạy", "tốc độ chạy");
            rep("rút\\s+đổi", "tốc độ");
            rep("trạy", "chạy");
            rep("chất\\s+vài|chất\\s+liệu\\s+vài", "chất liệu vải");
            rep("chúng\\s+nước|xíu\\s+trống\\s+nước|trống\\s+nước", "chống nước");
            rep("xíu(?=\\s+(?:chống|đẹp|nhẹ|bền|nhanh|mượt|êm))", "siêu");
            rep("đ[eé]o\\s+thử", "đeo thử");
            rep("đ[eé]o(?=\\s+(?:thử|lên|vào|chiếc|balo|tai|vai))", "đeo");
            rep("(?:lên|trên)\\s+vài", "lên vai");
            rep("em\\s+ai|em\\s+ài", "êm ái");
            rep("ưu\\s+đại|u\\s+đại", "ưu đãi");
            rep("linh\\s+mua\\s+hàng", "link mua hàng");
            rep("linh\\s+bên\\s+dưới", "link bên dưới");
            rep("dộng\\s+giải|rộng\\s+giải", "rộng rãi");
            rep("nhân\\s+viên\\s+vài", "nhân vật");
            rep("tai\\s+nghé", "tai nghe");
            rep("điện\\s+thoai", "điện thoại");
            rep("xe\\s+đập", "xe đạp");
            rep("kết\\s+l\\s*nối", "kết nối");
            rep("bảo\\s+hanh", "bảo hành");
            rep("khuyên\\s+mãi|khuyễn\\s+mãi", "khuyến mãi");
            rep("chính\\s+hang", "chính hãng");

            // 3. Lời kết video & Kêu gọi hành động (Call To Action)
            rep("nhớ\\s+bấm\\s+follow\\s+mình\\s+nhá", "nhớ bấm follow mình nhé");
            rep("nhớ\\s+follow\\s+kênh\\s+để\\s+xem\\s+thêm\\s+nhá", "nhớ follow kênh để xem thêm nhé");
            rep("đăng\\s+kí", "đăng ký");
            rep("nhá(?=[,.!?]|$)", "nhé");
            rep("nhà(?=[,.!?]|$)", "nha");

            // Restore protected idioms
            s = s.replace(/__CA_NHA__/g, "cả nhà");

            // 4. Định dạng câu, viết hoa chữ cái đầu và sau dấu chấm
            s = s.replace(/\s+/g, " ").trim();
            s = s.replace(/([.?!])\s*(\p{L})/gu, (_, p1, p2) => p1 + " " + p2.toUpperCase());
            if (s.length > 0) {
              s = s.charAt(0).toUpperCase() + s.slice(1);
              if (!/[.!?]$/.test(s)) {
                s += ".";
              }
              scriptText = s;
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
