// scripts/patch_unlock_video_and_smart_prompts.js
const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '../app/out/renderer/assets/VideoFactoryStudio.js');
let code = fs.readFileSync(targetFile, 'utf8');

console.log('[*] Đang tối ưu hóa kịch bản chuyển động & mở khóa tạo Video Veo 3.1...');

// 1. Thêm getSmartMotionPrompt & nâng cấp callGeminiVisionDirector
const oldDirectorStart = '// Helper: Call Gemini Vision for Motion Analysis (Flow.generate.text 1:1)';
const oldDirectorEnd = '// ============================================================================';

const newDirectorCode = `// 🎬 KỊCH BẢN CHUYỂN ĐỘNG CHUẨN 1:1 GOOGLE FLOW (TEMPORAL UGC FASHION & SOUNDSCAPE)
function getSmartMotionPrompt(sceneId, creativeDirection = '') {
  const loc = creativeDirection ? \`in \${creativeDirection}\` : 'in a luxurious modern bedroom with soft ambient lighting';
  switch (Number(sceneId)) {
    case 1:
      return \`A stylish young female KOC starts in the exact pose shown wearing comfortable pajamas \${loc}. She enthusiastically tears open the black plastic courier shipping bag with both hands, inspecting the newly arrived garment with a confident closed-mouth smile. Handheld smartphone UGC camera motion, subtle authentic shake, warm room lighting. Mouth strictly closed throughout. Soundscape: plastic courier bag tearing and rustling, adhesive tape peel, peaceful room tone.\`;
    case 2:
      return \`The same female KOC starts in the exact pose shown \${loc}. She holds up the folded new garment close to the camera lens, gently caressing and stretching the fabric to showcase its rich weave and fine craftsmanship with a proud closed-mouth smile. Handheld macro UGC camera framing. Mouth strictly closed throughout. Soundscape: soft textile rubbing, gentle cloth friction sounds, quiet room ambience.\`;
    case 3:
      return \`The same female KOC starts in the exact pose shown, now wearing the stunning new outfit \${loc}. She performs an elegant fashion runway walk directly towards the camera with natural dynamic strides, smiling with mouth closed. Handheld tracking camera stepping backward, authentic UGC lifestyle. Mouth strictly closed throughout. Soundscape: gentle footstep sounds on flooring, fabric swishing with movement, soft ambient air.\`;
    case 4:
      return \`The same female KOC starts in the exact pose shown \${loc}. She gracefully performs a smooth 360-degree spin, letting the fabric flare and demonstrating the silhouette and back design from all angles with a playful closed-mouth smile. Smooth handheld circular camera follow. Mouth strictly closed throughout. Soundscape: gentle swooshing sound of garment spinning in air, warm indoor acoustics.\`;
    case 5:
      return \`The same female KOC starts in the exact pose shown \${loc}. She strikes an over-the-shoulder model pose, gently brushing her hair back while looking warmly and directly into the lens with mouth firmly closed. Subtle handheld camera drift, soft cinematic lighting. Mouth strictly closed throughout. Soundscape: faint hair touch, soft room tone, quiet atmospheric hum.\`;
    case 6:
      return \`The same female KOC starts in the exact pose shown \${loc}. She assumes a striking fashion power stance with hands lightly on hips, body swaying subtly to highlight the tailored garment fit and comfort, smiling brightly with mouth closed. Handheld natural eye-level framing. Mouth strictly closed throughout. Soundscape: subtle cloth rustling, gentle indoor room acoustics.\`;
    case 7:
      return \`The same female KOC starts in the exact pose shown \${loc}. She offers a warm, friendly wave goodbye to the camera and takes a gentle step back as a natural closing gesture, beaming with a sincere closed-mouth smile. Handheld camera slowly pulling back. Mouth strictly closed throughout. Soundscape: gentle hand motion in air, soft room ambience, calm closing vibe.\`;
    default:
      return \`The female KOC starts in the exact pose shown \${loc}. She performs natural fashion posing movements showcasing the outfit with mouth strictly closed. Handheld UGC smartphone camera. Mouth strictly closed throughout. Soundscape: fabric rustling, natural room ambience.\`;
  }
}

// Helper: Call Gemini Vision for Motion Analysis (Flow.generate.text 1:1)
async function callGeminiVisionDirector(frame, action, activeKey) {
  const sys = "You are a professional video director. Analyze the provided image of a KOC (Key Opinion Leader) and write a high-fidelity video prompt for Veo 3.1.\\n\\nRules for the prompt:\\n1. STARTING FRAME: The video MUST begin exactly with the subject's pose, outfit, and background shown in the image.\\n2. CONTINUOUS MOTION: Describe 8 seconds of natural motion starting from that pose.\\n3. STYLE: Authentic smartphone UGC (User Generated Content). Handheld camera, slightly shaky, natural indoor lighting.\\n4. MOUTH STATUS: The subject's mouth must remain strictly CLOSED. No talking, no lip-syncing. \\n5. AUDIO (CRITICAL): The video must have immersive ambient sound. Use the phrase: \\\\\\"Soundscape: [detailed environmental sounds, fabric rustling, room tone, plastic crinkling]\\\\\\". Do not include human speech.\\n\\nOutput format:\\n[VIDEO PROMPT]:\\nA young woman [appearance from image], [location from image], starts in the exact pose shown. She then [detailed 8s movement]. Handheld shaky camera, authentic UGC vibe. Mouth strictly closed. Soundscape: [sounds].";

  if (!frame?.imageAsset) return null;
  const b64 = frame.imageAsset.base64 || frame.imageAsset.url || '';
  let cleanB64 = '';
  let mime = 'image/jpeg';

  if (b64.startsWith('data:')) {
    const match = b64.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      mime = match[1];
      cleanB64 = match[2];
    }
  } else if (!b64.startsWith('http') && b64.length > 100) {
    cleanB64 = b64;
  }

  // Nếu có API key hợp lệ thì gọi Gemini
  if (activeKey && activeKey.startsWith('AIzaSy')) {
    const models = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash-exp'];
    for (const m of models) {
      try {
        const bodyPayload = {
          contents: [{
            parts: [
              ...(cleanB64 ? [{ inline_data: { mime_type: mime, data: cleanB64 } }] : []),
              { text: \`Generate the video prompt for Scene \${frame.id}. The specific movement goal is: \${action}\` }
            ]
          }],
          system_instruction: {
            parts: [{ text: sys }]
          },
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 600
          }
        };

        const resp = await fetch(\`https://generativelanguage.googleapis.com/v1beta/models/\${m}:generateContent?key=\${activeKey}\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyPayload)
        });

        if (resp.ok) {
          const d = await resp.json();
          const text = d?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const final = text.split('[VIDEO PROMPT]:')[1]?.trim() || text.split('[PROMPT]:')[1]?.trim() || text.trim();
            if (final) return final;
          }
        }
      } catch (e) {
        console.warn(\`Gemini \${m} call error:\`, e);
      }
    }
  }

  // Luôn trả về kịch bản chuẩn 1:1 làm fallback tuyệt đối tin cậy
  return null;
}

`;

if (code.includes(oldDirectorStart) && code.includes(oldDirectorEnd)) {
  const p1 = code.indexOf(oldDirectorStart);
  const p2 = code.indexOf(oldDirectorEnd);
  code = code.substring(0, p1) + newDirectorCode + code.substring(p2);
  console.log('  ✓ Đã nạp hàm getSmartMotionPrompt & hoàn thiện callGeminiVisionDirector');
} else {
  console.warn('  ⚠️ Không tìm thấy vị trí callGeminiVisionDirector');
}

// 2. Cập nhật ensureRegisteredAsset siêu mượt, an toàn, không bao giờ ném lỗi
const oldEnsureStart = '// Helper to register / repair local file into Electron\'s asset storage';
const oldEnsureEnd = '// 🎬 KỊCH BẢN CHUYỂN ĐỘNG CHUẨN 1:1 GOOGLE FLOW';

const ultraEnsureCode = `// Helper to register / repair local file into Electron's asset storage
async function ensureRegisteredAsset(item, defaultName) {
  if (!item) return null;

  // 1. Ưu tiên số 1: Nếu đã có assetId từ Asset Store
  if (item.assetId && !String(item.assetId).startsWith('ref-')) {
    return item.assetId;
  }
  if (item.id && !String(item.id).startsWith('ref-')) {
    return item.id;
  }

  const api = window.aiforge?.assets || window.aivideo?.assets;

  // 2. Thu thập dataUrl
  let dataUrl = item.base64 || item.dataUrl;
  if (!dataUrl && typeof item.url === 'string' && item.url.startsWith('data:')) {
    dataUrl = item.url;
  }

  // 3. Nếu chưa có dataUrl nhưng có url hoặc localPath, đọc an toàn (timeout 2.5s)
  if (!dataUrl && item.url && typeof window !== 'undefined') {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const resp = await fetch(item.url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (resp.ok) {
        const blob = await resp.blob();
        dataUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(blob);
        });
      }
    } catch (_) {}
  }

  // 4. Import vào Asset Store qua API
  if (dataUrl && api?.importReference) {
    try {
      const imported = await api.importReference({
        name: item.name || defaultName || 'koc_scene_image.jpg',
        mimeType: item.mimeType || 'image/jpeg',
        dataUrl: dataUrl
      });
      if (imported?.id) {
        item.assetId = imported.id;
        return imported.id;
      }
    } catch (_) {}
  }

  return item.assetId || item.id || item.mediaId || null;
}

`;

if (code.includes(oldEnsureStart) && code.includes(oldEnsureEnd)) {
  const p1 = code.indexOf(oldEnsureStart);
  const p2 = code.indexOf(oldEnsureEnd);
  code = code.substring(0, p1) + ultraEnsureCode + code.substring(p2);
  console.log('  ✓ Đã cập nhật ensureRegisteredAsset siêu mượt');
}

// 3. Cập nhật analyzeMotion, generateSingleVideo, renderAllVideos
const oldActionsStart = '  // 🧠 2. Phân Tích Chuyển Động (Google Flow AI Vision 1:1 Đa Luồng Đồng Thời)';
const oldActionsEnd = '  // 🗑️ LÀM MỚI / XÓA SẠCH TOÀN BỘ DỮ LIỆU CŨ ĐỂ TẠO DỰ ÁN MỚI';

const newActionsCode = `  // 🧠 2. Phân Tích Chuyển Động (Google Flow AI Vision 1:1 Đa Luồng Đồng Thời)
  const analyzeMotion = async () => {
    const cs = stateRef.current;
    const readyFrames = cs.storyboard.filter(f => f.imageAsset);
    if (readyFrames.length === 0) {
      toast?.warn?.("Chưa có cảnh nào có ảnh! Vui lòng tạo ảnh trước khi phân tích chuyển động.");
      return;
    }

    setIsGeneratingPrompts(true);
    toast?.info?.(\`AI Director đang phân tích kịch bản chuyển động cho \${readyFrames.length} cảnh...\`);

    const activeGeminiKey = (geminiApiKey || localStorage.getItem('aivideo_gemini_api_key') || '').trim();

    // Đưa tất cả các cảnh sẵn sàng sang trạng thái generating
    setStoryboard(prev => prev.map(f => f.imageAsset ? { ...f, videoPromptStatus: "generating" } : f));

    // Chạy song song (Parallel Promise.all) đảm bảo 100% CẢ 7 CẢNH ĐỀU CÓ KỊCH BẢN CHUẨN XÁC
    const promises = readyFrames.map(async (frame) => {
      let action = "";
      switch (Number(frame.id)) {
        case 1: action = "Excitedly tearing open the black courier bag, plastic rustling sounds, looking at camera with a big closed-mouth smile."; break;
        case 2: action = "Detailed fabric showcase, moving material near lens, showing texture, happy facial expression with mouth closed."; break;
        case 3: action = "Fashion walk towards camera, dynamic stride, confident closed-mouth smile, showing full outfit in motion."; break;
        case 4: action = "Playful 360-degree spin, showing full outfit movement from all angles, dynamic garment drape."; break;
        case 5: action = "Over-the-shoulder gaze, adjusting hair cinematic pose, looking directly at lens with mouth closed."; break;
        case 6: action = "Powerful stance, hair flip, hands on hips fashion movement, subtle body sway highlighting outfit."; break;
        case 7: action = "Friendly wave and exit, soft camera movement follow, stepping back with a genuine closed-mouth smile."; break;
        default: action = "Natural fashion posing movement with mouth strictly closed.";
      }

      let generatedPrompt = null;
      try {
        generatedPrompt = await callGeminiVisionDirector(frame, action, activeGeminiKey);
      } catch (err) {
        console.warn(\`Lỗi phân tích Cảnh \${frame.id}, dùng kịch bản thông minh:\`, err);
      }

      // NẾU GEMINI TRẢ VỀ NULL HOẶC LỖI -> LUÔN DÙNG KỊCH BẢN CHUẨN 1:1 GOOGLE FLOW
      if (!generatedPrompt) {
        generatedPrompt = getSmartMotionPrompt(frame.id, cs.creativeDirection);
      }

      updateFrame(frame.id, {
        videoPrompt: generatedPrompt,
        videoPromptStatus: "done"
      });
    });

    await Promise.all(promises);
    setIsGeneratingPrompts(false);
    toast?.success?.("Đã hoàn tất kịch bản chuyển động 100% cho các cảnh! Bây giờ bạn có thể bấm 'TẠO TOÀN BỘ VIDEO'.");
  };

  // 3. Render 1 Video Đơn Lẻ (Image-to-Video Khóa Nhân Vật 100%)
  const generateSingleVideo = async (frameId) => {
    const cs = stateRef.current;
    const frame = cs.storyboard.find(f => f.id === frameId);
    if (!frame || !frame.imageAsset) {
      toast?.warn?.(\`Cảnh \${frameId} chưa có ảnh! Vui lòng tạo ảnh trước.\`);
      return;
    }

    // Nếu cảnh chưa có prompt, tự động điền prompt chuẩn
    const promptToSend = frame.videoPrompt || getSmartMotionPrompt(frameId, cs.creativeDirection);
    if (!frame.videoPrompt) {
      updateFrame(frameId, { videoPrompt: promptToSend, videoPromptStatus: "done" });
    }

    const now = Date.now();
    // ⚡ XÓA SẠCH VIDEO CŨ CỦA CẢNH NÀY NGAY LẬP TỨC
    updateFrame(frameId, {
      videoStatus: "generating",
      videoProgress: 15,
      videoAsset: null,
      videoJobId: null,
      videoRunStartTime: now
    });

    try {
      const qApi = window.aiforge?.queue || window.aivideo?.queue;
      const veoAcc = accounts.find(a => a.accountId === selectedVideoAccountId && a.providerId === 'veo3')
        || accounts.find(a => a.providerId === 'veo3' && a.authStatus === 'Logged In');
      const targetAccId = veoAcc?.accountId || undefined;

      if (!qApi?.addJob && !qApi?.addJobs) throw new Error("Hệ thống Queue chưa sẵn sàng");

      const modelDisplayName = FASHION_VIDEO_MODELS_MAP[cs.globalVideoModel] || 'Veo 3.1 - Lite [Lower Priority]';
      
      // 🎯 ĐẢM BẢO ẢNH CỦA CẢNH NÀY LÀ STARTING FRAME (I2V)
      let validAssetId = await ensureRegisteredAsset(frame.imageAsset, \`koc_scene_\${frameId}.jpg\`);
      if (!validAssetId && frame.imageAsset.assetId) {
        validAssetId = frame.imageAsset.assetId;
      }
      if (!validAssetId && frame.imageAsset.mediaId) {
        validAssetId = frame.imageAsset.mediaId;
      }

      const jobInput = {
        title: \`[KOC Thời Trang] Video Cảnh \${frameId}\`,
        type: "Video",
        providerId: "veo3",
        provider: "Veo3",
        ...(targetAccId ? { accountId: targetAccId } : {}),
        payload: {
          title: \`[KOC Thời Trang] Video Cảnh \${frameId}\`,
          prompt: promptToSend,
          // 🎯 3 TRƯỜNG CỐT LÕI ĐỂ GOOGLE FLOW VEO 3 KHÓA START FRAME (I2V)
          flowVideoMode: "I2V",
          videoMode: "I2V",
          mode: "I2V",
          referenceAssetIds: validAssetId ? [validAssetId] : [],
          inputImageAssetId: validAssetId || undefined,
          firstFrameImageMediaId: validAssetId || undefined,
          startImageMediaId: validAssetId || undefined,
          model: modelDisplayName,
          modelId: modelDisplayName,
          modelDisplayName: cs.globalVideoModel,
          ratio: "9:16",
          aspectRatio: "9:16",
          duration: "8s",
          durationSeconds: 8,
          studioSource: "fashion-factory",
          autoRemoveWatermark: true,
          removeWatermark: true,
          accountSelection: targetAccId ? "manual" : "auto"
        }
      };

      const res = await (qApi.addJobs ? qApi.addJobs([jobInput]) : qApi.addJob(jobInput));
      try { qApi.resume?.(); } catch(_) {}

      const jId = res?.results?.[0]?.job?.id || res?.results?.[0]?.id || res?.id || res?.jobId || null;
      updateFrame(frameId, { videoJobId: jId, videoStatus: "generating", videoProgress: 20 });
      toast?.info?.(\`Đang render Video Cảnh \${frameId} (I2V đồng nhất nhân vật)...\`);
    } catch (err) {
      console.error(err);
      toast?.error?.(\`Lỗi render Cảnh \${frameId}: \` + (err?.message || err));
      updateFrame(frameId, { videoStatus: "error", videoProgress: 0 });
    }
  };

  // 🚀 TẠO TOÀN BỘ VIDEO (ĐA LUỒNG SIÊU TỐC - TỰ ĐỘNG ĐIỀN KỊCH BẢN NẾU THIẾU - KHÓA 100% STARTING FRAME)
  const renderAllVideos = async () => {
    const cs = stateRef.current;
    // Bất kỳ cảnh nào có ảnh đều đủ điều kiện tạo video!
    const targetFrames = cs.storyboard.filter(f => f.imageAsset);
    if (targetFrames.length === 0) {
      toast?.warn?.("Chưa có cảnh nào có ảnh! Vui lòng bấm 'TẠO 7 CẢNH ẢNH' trước.");
      return;
    }

    const now = Date.now();
    // ⚡ XÓA SẠCH TOÀN BỘ VIDEO CŨ NGAY KHI PHÁT LỆNH RENDER MỚI!
    setStoryboard(prev => {
      const cleaned = prev.map(f => {
        const isTarget = targetFrames.some(tf => tf.id === f.id);
        if (!isTarget) return f;
        const promptToUse = f.videoPrompt || getSmartMotionPrompt(f.id, cs.creativeDirection);
        return {
          ...f,
          videoPrompt: promptToUse,
          videoPromptStatus: "done",
          videoAsset: null,
          videoStatus: "generating",
          videoProgress: 15,
          videoJobId: null,
          videoRunStartTime: now
        };
      });
      if (typeof window !== "undefined" && window.__AIFORGE_FASHION_PERSISTENCE__) {
        window.__AIFORGE_FASHION_PERSISTENCE__.storyboard = cleaned;
      }
      try { localStorage.setItem("aiforge_koc_storyboard", JSON.stringify(cleaned)); } catch(_) {}
      return cleaned;
    });

    setIsGeneratingVideos(true);
    toast?.info?.(\`🚀 Đang nạp đồng loạt \${targetFrames.length} Video vào Queue (Khóa Starting Frame từng cảnh)...\`);

    try {
      const qApi = window.aiforge?.queue || window.aivideo?.queue;
      if (!qApi?.addJobs && !qApi?.addJob) throw new Error("Hệ thống Queue chưa sẵn sàng");

      const veoAcc = accounts.find(a => a.accountId === selectedVideoAccountId && a.providerId === 'veo3')
        || accounts.find(a => a.providerId === 'veo3' && a.authStatus === 'Logged In');
      const targetAccId = veoAcc?.accountId || undefined;
      const modelDisplayName = FASHION_VIDEO_MODELS_MAP[cs.globalVideoModel] || 'Veo 3.1 - Lite [Lower Priority]';

      // Chuẩn bị từng job với ảnh Start Frame tương ứng của cảnh đó
      const jobs = [];
      for (const frame of targetFrames) {
        let validAssetId = await ensureRegisteredAsset(frame.imageAsset, \`koc_scene_\${frame.id}.jpg\`);
        if (!validAssetId && frame.imageAsset.assetId) {
          validAssetId = frame.imageAsset.assetId;
        }
        if (!validAssetId && frame.imageAsset.mediaId) {
          validAssetId = frame.imageAsset.mediaId;
        }

        const promptToSend = frame.videoPrompt || getSmartMotionPrompt(frame.id, cs.creativeDirection);

        jobs.push({
          title: \`[KOC Thời Trang] Video Cảnh \${frame.id}\`,
          type: "Video",
          providerId: "veo3",
          provider: "Veo3",
          ...(targetAccId ? { accountId: targetAccId } : {}),
          payload: {
            title: \`[KOC Thời Trang] Video Cảnh \${frame.id}\`,
            prompt: promptToSend,
            // 🎯 ĐỒNG NHẤT 100% NHÂN VẬT & TRANG PHỤC BẰNG CHẾ ĐỘ I2V GOOGLE FLOW
            flowVideoMode: "I2V",
            videoMode: "I2V",
            mode: "I2V",
            referenceAssetIds: validAssetId ? [validAssetId] : [],
            inputImageAssetId: validAssetId || undefined,
            firstFrameImageMediaId: validAssetId || undefined,
            startImageMediaId: validAssetId || undefined,
            model: modelDisplayName,
            modelId: modelDisplayName,
            modelDisplayName: cs.globalVideoModel,
            ratio: "9:16",
            aspectRatio: "9:16",
            duration: "8s",
            durationSeconds: 8,
            studioSource: "fashion-factory",
            autoRemoveWatermark: true,
            removeWatermark: true,
            accountSelection: targetAccId ? "manual" : "auto"
          }
        });
      }

      const res = await (qApi.addJobs ? qApi.addJobs(jobs) : Promise.all(jobs.map(j => qApi.addJob(j))));
      try { qApi.resume?.(); } catch(_) {}

      const jobResults = Array.isArray(res) ? res : (res?.results || []);

      setStoryboard(prev => prev.map(f => {
        const idxInReady = targetFrames.findIndex(rf => rf.id === f.id);
        if (idxInReady !== -1) {
          const jId = jobResults[idxInReady]?.job?.id || jobResults[idxInReady]?.id || null;
          return {
            ...f,
            videoJobId: jId,
            videoStatus: "generating",
            videoProgress: 20
          };
        }
        return f;
      }));

      toast?.success?.(\`Đã nạp \${jobs.length} video Image-to-Video sang hàng đợi! Tự động nạp khi hoàn tất.\`);
    } catch (err) {
      console.error("Lỗi nạp batch video:", err);
      toast?.error?.("Lỗi nạp video: " + (err?.message || err));
    } finally {
      setIsGeneratingVideos(false);
    }
  };

`;

if (code.includes(oldActionsStart) && code.includes(oldActionsEnd)) {
  const p1 = code.indexOf(oldActionsStart);
  const p2 = code.indexOf(oldActionsEnd);
  code = code.substring(0, p1) + newActionsCode + code.substring(p2);
  console.log('  ✓ Đã cập nhật xong bộ máy Phân Tích Chuyển Động & Tạo Video');
} else {
  console.warn('  ⚠️ Không tìm thấy vị trí oldActions');
}

// 4. Cập nhật UI Nút bấm ở Sidebar & từng cảnh
// Thay đổi điều kiện disabled và tiêu đề nút
code = code.replace(
  'disabled: !storyboard.some(f => f.videoPrompt)\n            }, "Render Toàn bộ Video"),',
  'disabled: !storyboard.some(f => f.imageAsset)\n            }, "TẠO TOÀN BỘ VIDEO"),'
);

code = code.replace(
  'disabled: !storyboard.some(f => f.videoPrompt)\n            }, "TẠO TOÀN BỘ VIDEO"),',
  'disabled: !storyboard.some(f => f.imageAsset)\n            }, "TẠO TOÀN BỘ VIDEO"),'
);

// Nút phân tích chuyển động
code = code.replace(
  '> "Phân tích chuyển động")',
  '> "PHÂN TÍCH CHUYỂN ĐỘNG")'
);

// Nút ở từng cảnh
code = code.replace(
  'disabled: !f.imageAsset || !f.videoPrompt,',
  'disabled: !f.imageAsset,'
);

code = code.replace(
  ': "Render Cảnh")',
  ': "Tạo Video Cảnh")'
);

fs.writeFileSync(targetFile, code, 'utf8');
console.log('[*] Kích thước file sau khi tối ưu:', code.length);
console.log('💎 HOÀN TẤT PATCH MỞ KHÓA TẠO VIDEO 100% 💎');
