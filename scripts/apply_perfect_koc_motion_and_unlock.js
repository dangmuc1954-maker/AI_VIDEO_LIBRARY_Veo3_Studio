// scripts/apply_perfect_koc_motion_and_unlock.js
const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '../app/out/renderer/assets/VideoFactoryStudio.js');
let code = fs.readFileSync(targetFile, 'utf8');

console.log('[*] File size before replacement:', code.length);

// ============================================================================
// KHỐI 1: getSmartMotionPrompt, ensureRegisteredAsset, callGeminiVisionDirector
// ============================================================================
const marker1Start = '// Helper to register / repair local file into Electron\'s asset storage';
const marker1End = '// ============================================================================';

const p1_start = code.indexOf(marker1Start);
const p1_end = code.indexOf(marker1End, p1_start);

if (p1_start === -1 || p1_end === -1) {
  console.error('❌ Không tìm thấy marker 1');
  process.exit(1);
}

const replacement1 = `// 🎬 KỊCH BẢN CHUYỂN ĐỘNG CHUẨN 1:1 GOOGLE FLOW (TEMPORAL UGC FASHION & SOUNDSCAPE)
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

// Helper to register / repair local file into Electron's asset storage
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

  return null;
}

`;

code = code.substring(0, p1_start) + replacement1 + code.substring(p1_end);
console.log('  ✓ Thay thế xong Khối 1');

// ============================================================================
// KHỐI 2: checkJobsAndAssets, generateAllImages, analyzeMotion, renderAllVideos...
// ============================================================================
const marker2Start = '// ⚡ BỘ ĐỒNG BỘ NỀN SIÊU TỐC: TỰ ĐỘNG QUÉT VÀ NẠP NGAY LẬP TỨC (< 1.2S) KỂ CẢ KHI CHUYỂN TAB SANG NƠI KHÁC!';
const marker2End = '// Tính tiến độ tổng thể (tự động tính dựa trên số cảnh đang tạo và đã hoàn thành)';

const p2_start = code.indexOf(marker2Start);
const p2_end = code.indexOf(marker2End, p2_start);

if (p2_start === -1 || p2_end === -1) {
  console.error('❌ Không tìm thấy marker 2');
  process.exit(1);
}

const replacement2 = `// ⚡ BỘ ĐỒNG BỘ NỀN SIÊU TỐC: TỰ ĐỘNG QUÉT VÀ NẠP NGAY LẬP TỨC (< 1.2S) KỂ CẢ KHI CHUYỂN TAB SANG NƠI KHÁC!
  // ĐẶC BIỆT: CHỈ NẠP JOB CỦA ĐỢT CHẠY HIỆN TẠI, TUYỆT ĐỐI KHÔNG NẠP LẠI ẢNH/VIDEO CŨ CỦA LẦN CHẠY TRƯỚC!
  React.useEffect(() => {
    let isMounted = true;
    const checkJobsAndAssets = async () => {
      try {
        const qApi = window.aiforge?.queue || window.aivideo?.queue;
        const aApi = window.aiforge?.assets || window.aivideo?.assets;
        if (!qApi?.list) return;

        const [rawQueue, rawAssets] = await Promise.all([
          qApi.list().catch(() => null),
          aApi?.list ? aApi.list().catch(() => []) : Promise.resolve([])
        ]);

        if (!isMounted) return;

        const jobs = Array.isArray(rawQueue) ? rawQueue : (rawQueue?.jobs || []);
        const assets = Array.isArray(rawAssets) ? rawAssets : (rawAssets?.assets || []);
        if (jobs.length === 0 && assets.length === 0) return;

        const sortedJobs = [...jobs].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

        setStoryboard(prev => {
          let changed = false;
          const next = prev.map(f => {
            let updated = { ...f };

            // 1. Quét Ảnh Cảnh (Chỉ nhận job mới sau thời điểm phát lệnh tạo mới)
            if (!updated.imageAsset || updated.imageJobId || updated.imageStatus === 'generating') {
              let imgJob = null;
              if (updated.imageJobId) {
                imgJob = sortedJobs.find(j => j.id === updated.imageJobId);
              }
              if (!imgJob && updated.imageRunStartTime) {
                // CHẶN TRIỆT ĐỂ LỖI NẠP ẢNH CŨ: Chỉ chấp nhận job được tạo ra SAU thời điểm bấm lệnh tạo
                imgJob = sortedJobs.find(j => {
                  if (j.type !== 'Image') return false;
                  const isTitleMatch = j.title?.includes(\`[KOC Thời Trang] Storyboard Cảnh \${f.id}\`) ||
                                       j.payload?.title?.includes(\`[KOC Thời Trang] Storyboard Cảnh \${f.id}\`);
                  if (!isTitleMatch) return false;
                  const jobTime = new Date(j.createdAt || 0).getTime();
                  return jobTime >= (updated.imageRunStartTime - 3000);
                });
              }

              if (imgJob) {
                if (imgJob.status === 'Completed') {
                  const resAsset = imgJob.result?.assets?.[0];
                  const matchedAsset = (assets || []).find(a => 
                    a.jobId === imgJob.id || 
                    a.id === imgJob.resultAssetId || 
                    a.id === imgJob.result?.assetId || 
                    (resAsset && (a.id === resAsset.assetId || a.id === resAsset.id))
                  ) || resAsset;

                  if (matchedAsset && (matchedAsset.url || matchedAsset.localPath || matchedAsset.thumbnailUrl)) {
                    const bestUrl = matchedAsset.thumbnailUrl || matchedAsset.url || (matchedAsset.localPath ? 'file:///' + matchedAsset.localPath.replace(/\\\\/g, '/') : '');
                    updated.imageAsset = {
                      url: bestUrl,
                      thumbnailUrl: matchedAsset.thumbnailUrl || bestUrl,
                      localPath: matchedAsset.localPath || '',
                      assetId: matchedAsset.assetId || matchedAsset.id,
                      base64: bestUrl,
                      mimeType: matchedAsset.mimeType || 'image/jpeg'
                    };
                    updated.imageStatus = 'done';
                    updated.imageProgress = 100;
                    updated.imageJobId = null;
                    changed = true;
                  }
                } else if (imgJob.status === 'Running' || imgJob.status === 'Pending') {
                  const prog = imgJob.progress || (imgJob.status === 'Running' ? 65 : 25);
                  if (updated.imageProgress !== prog || updated.imageStatus !== 'generating') {
                    updated.imageStatus = 'generating';
                    updated.imageProgress = prog;
                    changed = true;
                  }
                } else if (imgJob.status === 'Failed' || imgJob.status === 'Canceled') {
                  updated.imageStatus = 'error';
                  updated.imageJobId = null;
                  changed = true;
                }
              }
            }

            // 2. Quét Video Cảnh (Chỉ nhận video job sau thời điểm phát lệnh tạo video mới)
            if (!updated.videoAsset || updated.videoJobId || updated.videoStatus === 'generating') {
              let vidJob = null;
              if (updated.videoJobId) {
                vidJob = sortedJobs.find(j => j.id === updated.videoJobId);
              }
              if (!vidJob && updated.videoRunStartTime) {
                // CHẶN TRIỆT ĐỂ LỖI NẠP VIDEO CŨ: Chỉ chấp nhận job video được tạo ra SAU thời điểm bấm lệnh
                vidJob = sortedJobs.find(j => {
                  if (j.type !== 'Video') return false;
                  const isTitleMatch = j.title?.includes(\`[KOC Thời Trang] Video Cảnh \${f.id}\`) ||
                                       j.payload?.title?.includes(\`[KOC Thời Trang] Video Cảnh \${f.id}\`);
                  if (!isTitleMatch) return false;
                  const jobTime = new Date(j.createdAt || 0).getTime();
                  return jobTime >= (updated.videoRunStartTime - 3000);
                });
              }

              if (vidJob) {
                if (vidJob.status === 'Completed') {
                  const resAsset = vidJob.result?.assets?.[0];
                  const matchedAsset = (assets || []).find(a => 
                    a.jobId === vidJob.id || 
                    a.id === vidJob.resultAssetId || 
                    a.id === vidJob.result?.assetId || 
                    (resAsset && (a.id === resAsset.assetId || a.id === resAsset.id))
                  ) || resAsset;

                  if (matchedAsset && (matchedAsset.url || matchedAsset.localPath || matchedAsset.videoUrl)) {
                    const bestUrl = matchedAsset.videoUrl || matchedAsset.url || (matchedAsset.localPath ? 'file:///' + matchedAsset.localPath.replace(/\\\\/g, '/') : '');
                    updated.videoAsset = {
                      url: bestUrl,
                      videoUrl: bestUrl,
                      localPath: matchedAsset.localPath || '',
                      assetId: matchedAsset.assetId || matchedAsset.id,
                      mimeType: matchedAsset.mimeType || 'video/mp4'
                    };
                    updated.videoStatus = 'done';
                    updated.videoProgress = 100;
                    updated.videoJobId = null;
                    changed = true;
                  }
                } else if (vidJob.status === 'Running' || vidJob.status === 'Pending') {
                  const prog = vidJob.progress || (vidJob.status === 'Running' ? 65 : 25);
                  if (updated.videoProgress !== prog || updated.videoStatus !== 'generating') {
                    updated.videoStatus = 'generating';
                    updated.videoProgress = prog;
                    changed = true;
                  }
                } else if (vidJob.status === 'Failed' || vidJob.status === 'Canceled') {
                  updated.videoStatus = 'error';
                  updated.videoJobId = null;
                  changed = true;
                }
              }
            }

            return updated;
          });

          if (changed) {
            if (typeof window !== "undefined" && window.__AIFORGE_FASHION_PERSISTENCE__) {
              window.__AIFORGE_FASHION_PERSISTENCE__.storyboard = next;
            }
            try { localStorage.setItem("aiforge_koc_storyboard", JSON.stringify(next)); } catch(_) {}
            return next;
          }
          return prev;
        });
      } catch (err) {
        console.warn("[Fashion] Polling scan error:", err);
      }
    };

    const itv = setInterval(checkJobsAndAssets, 1200);
    checkJobsAndAssets();
    return () => {
      isMounted = false;
      clearInterval(itv);
    };
  }, []);

  // 1. Tạo 1 Cảnh Ảnh Đơn Lẻ
  const generateSingleImage = async (frameId) => {
    const cs = stateRef.current;
    if (!cs.koc || !cs.outfit) {
      toast?.warn?.("Vui lòng tải lên cả Gương mặt KOC và Mẫu Trang phục trước!");
      return;
    }

    const now = Date.now();
    // ⚡ XÓA SẠCH DỮ LIỆU CŨ CỦA CẢNH NÀY NGAY LẬP TỨC
    updateFrame(frameId, {
      imageStatus: "generating",
      imageProgress: 15,
      imageAsset: null,
      imageJobId: null,
      imageRunStartTime: now,
      videoAsset: null,
      videoStatus: "idle",
      videoProgress: 0,
      videoJobId: null,
      videoRunStartTime: 0,
      videoPrompt: "",
      videoPromptStatus: "idle"
    });

    try {
      const frame = cs.storyboard.find(f => f.id === frameId);
      if (!frame) return;
      const prompt = frame.imagePrompt.replace(/\\[Environment Style\\]/g, cs.creativeDirection);

      const validKocId = await ensureRegisteredAsset(cs.koc, 'koc_face.jpg');
      const validOutfitId = await ensureRegisteredAsset(cs.outfit, 'outfit_sample.jpg');
      if (validKocId && validKocId !== cs.koc.assetId) {
        setKoc(prev => prev ? { ...prev, assetId: validKocId, mediaId: validKocId } : prev);
      }
      if (validOutfitId && validOutfitId !== cs.outfit.assetId) {
        setOutfit(prev => prev ? { ...prev, assetId: validOutfitId, mediaId: validOutfitId } : prev);
      }

      const refs = [validKocId, validOutfitId].filter(Boolean);
      const qApi = window.aiforge?.queue || window.aivideo?.queue;
      if (!qApi?.addJobs && !qApi?.addJob) throw new Error("Hệ thống Queue chưa sẵn sàng");

      const bananaAcc = accounts.find(a => a.accountId === selectedBananaAccountId && a.providerId === 'banana')
        || accounts.find(a => a.providerId === 'banana' && a.authStatus === 'Logged In');
      const targetAccId = bananaAcc?.accountId || undefined;

      const jobInput = {
        title: \`[KOC Thời Trang] Storyboard Cảnh \${frameId}\`,
        type: "Image",
        providerId: "banana",
        provider: "Banana",
        ...(targetAccId ? { accountId: targetAccId } : {}),
        payload: {
          title: \`[KOC Thời Trang] Storyboard Cảnh \${frameId}\`,
          prompt: prompt + ", professional commercial photography, 9:16 vertical, ultra realistic, highly detailed fabric, crisp textures, soft luxury studio lighting",
          ratio: "9:16",
          aspectRatio: "9:16",
          referenceAssetIds: refs,
          model: "banana",
          modelDisplayName: FASHION_IMAGE_MODEL,
          studioSource: "fashion-factory",
          autoRemoveWatermark: true,
          removeWatermark: true,
          accountSelection: targetAccId ? "manual" : "auto"
        }
      };

      const res = await (qApi.addJobs ? qApi.addJobs([jobInput]) : qApi.addJob(jobInput));
      try { qApi.resume?.(); } catch(_) {}

      const jId = res?.results?.[0]?.job?.id || res?.results?.[0]?.id || res?.id || res?.jobId || null;
      updateFrame(frameId, { imageJobId: jId, imageStatus: "generating", imageProgress: 20 });
      toast?.info?.(\`Đang tạo Cảnh \${frameId} trong hàng đợi...\`);
    } catch (err) {
      console.error(err);
      toast?.error?.(\`Lỗi tạo Cảnh \${frameId}: \` + (err?.message || err));
      updateFrame(frameId, { imageStatus: "error", imageProgress: 0 });
    }
  };

  // 🚀 TẠO CHUNG 1 LẦN TẤT CẢ 7 CẢNH ẢNH (ĐA LUỒNG SIÊU TỐC - TỰ ĐỘNG NẠP ĐÚNG CẢNH)
  const generateAllImages = async () => {
    const cs = stateRef.current;
    if (!cs.koc || !cs.outfit) {
      toast?.warn?.("Vui lòng tải lên Gương mặt KOC và Mẫu Trang phục!");
      return;
    }

    const now = Date.now();
    // ⚡ BẮT BUỘC: XÓA SẠCH 100% DỮ LIỆU CŨ NGAY KHI PHÁT LỆNH ĐỂ DỮ LIỆU MỚI NẠP VÀO!
    setStoryboard(prev => {
      const cleaned = prev.map(f => ({
        ...f,
        imageAsset: null,
        imageStatus: "generating",
        imageProgress: 15,
        imageJobId: null,
        imageRunStartTime: now,
        videoAsset: null,
        videoStatus: "idle",
        videoProgress: 0,
        videoJobId: null,
        videoRunStartTime: 0,
        videoPrompt: "",
        videoPromptStatus: "idle"
      }));
      if (typeof window !== "undefined" && window.__AIFORGE_FASHION_PERSISTENCE__) {
        window.__AIFORGE_FASHION_PERSISTENCE__.storyboard = cleaned;
      }
      try { localStorage.setItem("aiforge_koc_storyboard", JSON.stringify(cleaned)); } catch(_) {}
      return cleaned;
    });

    setIsGeneratingImages(true);
    toast?.info?.("🚀 Bắt đầu sản xuất đồng thời 7 Cảnh Ảnh (Đa luồng Nano Banana Pro)...");

    try {
      const validKocId = await ensureRegisteredAsset(cs.koc, 'koc_face.jpg');
      const validOutfitId = await ensureRegisteredAsset(cs.outfit, 'outfit_sample.jpg');
      if (validKocId && validKocId !== cs.koc.assetId) {
        setKoc(prev => prev ? { ...prev, assetId: validKocId, mediaId: validKocId } : prev);
      }
      if (validOutfitId && validOutfitId !== cs.outfit.assetId) {
        setOutfit(prev => prev ? { ...prev, assetId: validOutfitId, mediaId: validOutfitId } : prev);
      }

      const refs = [validKocId, validOutfitId].filter(Boolean);
      const qApi = window.aiforge?.queue || window.aivideo?.queue;
      if (!qApi?.addJobs && !qApi?.addJob) throw new Error("Hệ thống Queue chưa sẵn sàng");

      const bananaAcc = accounts.find(a => a.accountId === selectedBananaAccountId && a.providerId === 'banana')
        || accounts.find(a => a.providerId === 'banana' && a.authStatus === 'Logged In');
      const targetAccId = bananaAcc?.accountId || undefined;

      // Nạp cùng lúc 7 jobs vào Queue để chạy song song
      const jobs = cs.storyboard.map(frame => {
        const prompt = frame.imagePrompt.replace(/\\[Environment Style\\]/g, cs.creativeDirection);
        return {
          title: \`[KOC Thời Trang] Storyboard Cảnh \${frame.id}\`,
          type: "Image",
          providerId: "banana",
          provider: "Banana",
          ...(targetAccId ? { accountId: targetAccId } : {}),
          payload: {
            title: \`[KOC Thời Trang] Storyboard Cảnh \${frame.id}\`,
            prompt: prompt + ", professional commercial photography, 9:16 vertical, ultra realistic, highly detailed fabric, crisp textures, soft luxury studio lighting",
            ratio: "9:16",
            aspectRatio: "9:16",
            referenceAssetIds: refs,
            model: "banana",
            modelDisplayName: FASHION_IMAGE_MODEL,
            studioSource: "fashion-factory",
            autoRemoveWatermark: true,
            removeWatermark: true,
            accountSelection: targetAccId ? "manual" : "auto"
          }
        };
      });

      const res = await (qApi.addJobs ? qApi.addJobs(jobs) : Promise.all(jobs.map(j => qApi.addJob(j))));
      try { qApi.resume?.(); } catch(_) {}

      const jobResults = Array.isArray(res) ? res : (res?.results || []);

      setStoryboard(prev => prev.map((f, idx) => {
        const jId = jobResults[idx]?.job?.id || jobResults[idx]?.id || null;
        return {
          ...f,
          imageJobId: jId,
          imageStatus: "generating",
          imageProgress: 20
        };
      }));

      toast?.success?.("Đã nạp 7 Cảnh Ảnh chạy song song! Khi xong ảnh nào sẽ tự nạp đúng cảnh đó ngay lập tức.");
    } catch (err) {
      console.error("Lỗi nạp batch ảnh:", err);
      toast?.error?.("Lỗi nạp ảnh: " + (err?.message || err));
    } finally {
      setIsGeneratingImages(false);
    }
  };

  // 🧠 2. Phân Tích Chuyển Động (Google Flow AI Vision 1:1 Đa Luồng Đồng Thời)
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

  // 🗑️ LÀM MỚI / XÓA SẠCH TOÀN BỘ DỮ LIỆU CŨ ĐỂ TẠO DỰ ÁN MỚI
  const handleResetAllData = () => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sạch toàn bộ 7 ảnh, 7 video và kịch bản cũ để bắt đầu dự án mới không?")) return;
    const freshStoryboard = INITIAL_FASHION_STORYBOARD.map(f => ({
      ...f,
      imageAsset: null,
      imageStatus: "idle",
      imageProgress: 0,
      imageJobId: null,
      imageRunStartTime: 0,
      videoAsset: null,
      videoStatus: "idle",
      videoProgress: 0,
      videoJobId: null,
      videoRunStartTime: 0,
      videoPrompt: "",
      videoPromptStatus: "idle"
    }));
    setStoryboard(freshStoryboard);
    if (typeof window !== "undefined" && window.__AIFORGE_FASHION_PERSISTENCE__) {
      window.__AIFORGE_FASHION_PERSISTENCE__.storyboard = freshStoryboard;
    }
    try { localStorage.setItem("aiforge_koc_storyboard", JSON.stringify(freshStoryboard)); } catch(_) {}
    toast?.success?.("Đã xóa sạch dữ liệu cũ, sẵn sàng cho dự án mới!");
  };

  // Tải 1 video về máy
  const handleDownloadSingle = async (f) => {
    if (!f.videoAsset) return;
    try {
      const api = window.aiforge?.assets || window.aivideo?.assets;
      if (f.videoAsset.assetId && api?.exportAsset) {
        await api.exportAsset(f.videoAsset.assetId);
        toast?.success?.(\`Đã tải Cảnh \${f.id} về máy!\`);
      } else if (f.videoAsset.url) {
        const a = document.createElement("a");
        a.href = f.videoAsset.url;
        a.download = \`koc_scene_\${f.id}.mp4\`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast?.success?.(\`Đang tải Cảnh \${f.id}...\`);
      }
    } catch (err) {
      toast?.error?.("Lỗi tải video: " + err.message);
    }
  };

  // Tải tất cả video
  const downloadAll = async () => {
    const framesWithVideos = storyboard.filter(f => f.videoAsset);
    if (framesWithVideos.length === 0) {
      toast?.warn?.("Chưa có video nào hoàn tất để tải về!");
      return;
    }
    toast?.info?.(\`Đang tải xuống \${framesWithVideos.length} clips video...\`);
    for (const f of framesWithVideos) {
      await handleDownloadSingle(f);
      await new Promise(r => setTimeout(r, 600));
    }
    toast?.success?.("Đã tải xong toàn bộ video!");
  };

  `;

code = code.substring(0, p2_start) + replacement2 + code.substring(p2_end);
console.log('  ✓ Thay thế xong Khối 2');

// ============================================================================
// KHỐI 3: CẬP NHẬT UI NÚT BẤM (MỞ KHÓA TẠO VIDEO & THÊM NÚT RESET)
// ============================================================================
// Thay nút 2 text: "Phân tích chuyển động" -> "PHÂN TÍCH CHUYỂN ĐỘNG"
code = code.replace(
  '> "Phân tích chuyển động")',
  '> "PHÂN TÍCH CHUYỂN ĐỘNG")'
);

// Thay nút 3: Render Toàn bộ Video -> TẠO TOÀN BỘ VIDEO & điều kiện disabled: !storyboard.some(f => f.imageAsset)
const oldBtn3Block = `// Button 3: Render Toàn bộ Video
            React.createElement(KocPillButton, {
              variant: "solid",
              icon: React.createElement("span", null, "🎬"),
              onClick: renderAllVideos,
              loading: isGeneratingVideos,
              progress: overallVideoProgress,
              disabled: !storyboard.some(f => f.videoPrompt)
            }, "Render Toàn bộ Video"),`;

const newBtn3Block = `// Button 3: TẠO TOÀN BỘ VIDEO (Mở khóa ngay khi có ảnh)
            React.createElement(KocPillButton, {
              variant: "solid",
              icon: React.createElement("span", null, "🎬"),
              onClick: renderAllVideos,
              loading: isGeneratingVideos,
              progress: overallVideoProgress,
              disabled: !storyboard.some(f => f.imageAsset)
            }, "TẠO TOÀN BỘ VIDEO"),

            // Button 4: Xóa sạch dữ liệu cũ
            React.createElement("button", {
              type: "button",
              onClick: handleResetAllData,
              className: "w-full py-2 px-3 rounded-2xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm mt-1"
            },
              React.createElement("span", null, "🗑️"),
              React.createElement("span", null, "Xóa Sạch Dữ Liệu Cũ")
            ),`;

if (code.includes(oldBtn3Block)) {
  code = code.replace(oldBtn3Block, newBtn3Block);
  console.log('  ✓ Đã cập nhật nút TẠO TOÀN BỘ VIDEO & nút Xóa Sạch Dữ Liệu Cũ');
} else {
  console.warn('  ⚠️ Không tìm thấy vị trí nút 3');
}

// Thay nút ở card từng cảnh:
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
console.log('💎 HOÀN TẤT PATCH HOÀN MỸ CHO VideoFactoryStudio.js 💎');
