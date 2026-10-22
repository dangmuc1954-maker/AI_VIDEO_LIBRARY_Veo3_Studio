const fs = require('fs');
const path = require('path');

console.log('======================================================================');
console.log('✨ NÂNG CẤP CHUẨN HÓA TIẾNG VIỆT UNICODE & TEXTAREA CHỈNH SỬA KỊCH BẢN ✨');
console.log('======================================================================');

// 1. UPDATE app/out/main/index.js
const mainPath = path.join(__dirname, '../app/out/main/index.js');
let mainCode = fs.readFileSync(mainPath, 'utf8');

const pStart = mainCode.indexOf('async transcribeVideoAudio(');
const pEnd = mainCode.indexOf('async mergeAudios(', pStart);

if (pStart === -1 || pEnd === -1) {
  console.error('❌ Không tìm thấy transcribeVideoAudio trong main!');
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
            // Protect idioms like "cả nhà" from ending particle "nha"
            s = s.replace(/(?<![\\p{L}\\p{N}])cả\\s+nhà(?![\\p{L}\\p{N}])/giu, '__CA_NHA__');

            const rep = (pat, repl) => {
              const re = new RegExp("(?<![\\\\p{L}\\\\p{N}])" + pat + "(?![\\\\p{L}\\\\p{N}])", "giu");
              s = s.replace(re, repl);
            };

            // 1. Lời chào mở đầu (Greetings)
            rep("(?:trong|chong|choang|cho|chúng)\\\\s+mình\\\\s+các\\\\s+bạn", "Chào mừng các bạn");
            rep("(?:trong|chong|choang|cho|chúng)\\\\s+mình\\\\s+mọi\\\\s+người", "Chào mừng mọi người");
            rep("xin\\\\s+chào\\\\s+các\\\\s+bạn\\\\s+đã\\\\s+quay\\\\s+trở\\\\s+lại", "Chào mừng các bạn đã quay trở lại");

            // 2. Chủ ngữ & Đối tượng (Subjects & Product Names)
            rep("chia\\\\s+sẻ\\\\s+này", "chiếc xe này");
            rep("chia\\\\s+sẻ(?=\\\\s+(?:này|đạp|chạy|đi|có|rất|được))", "chiếc xe");
            rep("3\\\\s*lo|bà\\\\s*lôn|ba\\\\s*lo|balon", "balo");
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

            // 3. Lời kết video & Kêu gọi hành động (Call To Action)
            rep("nhớ\\\\s+bấm\\\\s+follow\\\\s+mình\\\\s+nhá", "nhớ bấm follow mình nhé");
            rep("nhớ\\\\s+follow\\\\s+kênh\\\\s+để\\\\s+xem\\\\s+thêm\\\\s+nhá", "nhớ follow kênh để xem thêm nhé");
            rep("đăng\\\\s+kí", "đăng ký");
            rep("nhá(?=[,.!?]|$)", "nhé");
            rep("nhà(?=[,.!?]|$)", "nha");

            // Restore protected idioms
            s = s.replace(/__CA_NHA__/g, "cả nhà");

            // 4. Định dạng câu, viết hoa chữ cái đầu và sau dấu chấm
            s = s.replace(/\\s+/g, " ").trim();
            s = s.replace(/([.?!])\\s*(\\p{L})/gu, (_, p1, p2) => p1 + " " + p2.toUpperCase());
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
`;

mainCode = mainCode.slice(0, pStart) + newTranscribeMethod + mainCode.slice(pEnd);
fs.writeFileSync(mainPath, mainCode, 'utf8');
console.log('✓ Đã cập nhật bộ từ điển nhận diện tiếng Việt Unicode siêu chuẩn vào main/index.js!');

// 2. UPDATE WorkflowEditor-BFJj-KsD.js with editable textarea
const editorPath = path.join(__dirname, '../app/out/renderer/assets/WorkflowEditor-BFJj-KsD.js');
let editorCode = fs.readFileSync(editorPath, 'utf8');

const targetCardSnippet = 'e.type==="video-script-extract"&&t.jsxs("div",{className:"flex-1 flex flex-col gap-1.5 p-2 bg-[#130f2440] border border-white/5 rounded-lg min-h-0 overflow-y-auto scrollbar-thin text-left",children:[t.jsxs("div",{className:"text-[11px] text-text-muted flex justify-between select-none",children:[t.jsx("span",{children:"Tác vụ:"}),t.jsx("span",{className:"font-semibold text-text-primary",children:"Chuyển âm thanh sang văn bản"})]}),e.config?.outputText?t.jsxs("div",{className:"mt-1 border-t border-white/5 pt-1",children:[t.jsx("span",{className:"text-[10px] text-emerald-400 font-bold uppercase",children:"Văn bản lời thoại đã nhận diện:"}),t.jsx("div",{className:"text-[11px] text-text-secondary bg-white/5 p-1.5 rounded mt-1 max-h-24 overflow-y-auto whitespace-pre-wrap select-text",children:e.config.outputText})]}):t.jsx("div",{className:"text-[10px] text-text-muted italic mt-1",children:"Nối Video Veo 3 vào node này để chuyển âm thanh sang văn bản tự động"})]}),';

const replacementCardSnippet = 'e.type==="video-script-extract"&&t.jsxs("div",{className:"flex-1 flex flex-col gap-1.5 p-2 bg-[#130f2440] border border-white/5 rounded-lg min-h-0 overflow-y-auto scrollbar-thin text-left",children:[t.jsxs("div",{className:"text-[11px] text-text-muted flex justify-between select-none",children:[t.jsx("span",{children:"Tác vụ:"}),t.jsx("span",{className:"font-semibold text-text-primary",children:"Âm thanh → Văn bản"})]}),t.jsxs("div",{className:"mt-1 border-t border-white/5 pt-1 flex flex-col gap-1",children:[t.jsx("span",{className:"text-[10px] text-emerald-400 font-bold uppercase select-none",children:"Kịch bản thoại (có thể gõ chỉnh sửa):"}),t.jsx("textarea",{className:"w-full text-[11px] text-text-primary bg-black/40 border border-emerald-500/30 focus:border-emerald-400 rounded p-1.5 min-h-[64px] max-h-28 resize-y overflow-y-auto scrollbar-thin select-text focus:outline-none placeholder:text-text-muted",value:e.config?.outputText||"",placeholder:"Nối video Veo 3 để tự động nhận diện hoặc tự gõ kịch bản thoại tại đây...",onChange:ev=>{f({...e.config,outputText:ev.target.value})}})]})]}),';

if (editorCode.includes(targetCardSnippet)) {
  editorCode = editorCode.replace(targetCardSnippet, replacementCardSnippet);
  fs.writeFileSync(editorPath, editorCode, 'utf8');
  console.log('✓ Đã nâng cấp node "Đọc Kịch Bản" thành Textarea tương tác: Tự động bóc chuẩn + Cho phép Tris click gõ sửa trực tiếp!');
} else {
  console.warn('⚠️ targetCardSnippet không khớp chính xác, kiểm tra lại.');
}

console.log('======================================================================');
console.log('✅ HOÀN TẤT NÂNG CẤP BỘ LỌC TỪ NGỮ VÀ UI TƯƠNG TÁC!');
console.log('======================================================================');
