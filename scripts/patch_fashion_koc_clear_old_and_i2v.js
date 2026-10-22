// scripts/patch_fashion_koc_clear_old_and_i2v.js
const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '../app/out/renderer/assets/VideoFactoryStudio.js');
let code = fs.readFileSync(targetFile, 'utf8');

console.log('[*] File size before patch:', code.length);

// 1. Cập nhật ensureRegisteredAsset siêu vững chắc
const oldEnsureStart = '// Helper to register / repair local file into Electron\'s asset storage';
const oldEnsureEnd = '// Helper: Call Gemini Vision for Motion Analysis (Flow.generate.text 1:1)';

const newEnsureCode = `// Helper to register / repair local file into Electron's asset storage
async function ensureRegisteredAsset(item, defaultName) {
  if (!item) return null;
  const api = window.aiforge?.assets || window.aivideo?.assets;

  // 1. Nếu item đã có assetId hợp lệ (không phải ref- tạm thời), kiểm tra xem có tồn tại trong Assets store
  if (item.assetId && !String(item.assetId).startsWith('ref-')) {
    try {
      if (api?.getAsset) {
        const existing = await api.getAsset(item.assetId);
        if (existing) return item.assetId;
      }
      if (api?.list) {
        const list = await api.list();
        const assets = Array.isArray(list) ? list : (list?.assets || []);
        if (assets.some(a => (a.id === item.assetId || a.assetId === item.assetId))) {
          return item.assetId;
        }
      }
    } catch (_) {}
  }

  // 2. Thu thập dataUrl hợp lệ từ base64, dataUrl hoặc url
  let dataUrl = item.base64 || item.dataUrl;
  if (!dataUrl && item.url && item.url.startsWith('data:')) {
    dataUrl = item.url;
  }

  // 3. Nếu là file local (file:///) hoặc URL ngoài, fetch sang dataUrl
  if (!dataUrl && item.url) {
    try {
      const resp = await fetch(item.url);
      const blob = await resp.blob();
      dataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.warn('ensureRegisteredAsset fetch dataUrl warning:', item.url, e);
    }
  }

  // 4. Đăng ký asset vào Store qua importReference
  if (dataUrl && api?.importReference) {
    try {
      const imported = await api.importReference({
        name: item.name || defaultName || 'koc_reference.jpg',
        mimeType: item.mimeType || 'image/jpeg',
        dataUrl: dataUrl
      });
      if (imported?.id) {
        item.assetId = imported.id;
        return imported.id;
      }
    } catch (err) {
      console.warn('ensureRegisteredAsset importReference error:', err);
    }
  }

  return item.assetId || item.id || null;
}

`;

if (code.includes(oldEnsureStart) && code.includes(oldEnsureEnd)) {
  const p1 = code.indexOf(oldEnsureStart);
  const p2 = code.indexOf(oldEnsureEnd);
  code = code.substring(0, p1) + newEnsureCode + code.substring(p2);
  console.log('  ✓ Đã nâng cấp ensureRegisteredAsset');
} else {
  console.warn('  ⚠️ Không tìm thấy vị trí ensureRegisteredAsset');
}

// 2. Cập nhật toàn bộ logic checkJobsAndAssets, generateAllImages, renderAllVideos, v.v.
const oldCompStart = '  // ⚡ BỘ ĐỒNG BỘ NỀN SIÊU TỐC: TỰ ĐỘNG QUÉT VÀ NẠP NGAY LẬP TỨC (< 1.2S) KỂ CẢ KHI CHUYỂN TAB SANG NƠI KHÁC!';
const oldCompEnd = '  // Tính tiến độ tổng thể (tự động tính dựa trên số cảnh đang tạo và đã hoàn thành)';

const newCompLogic = `  // ⚡ BỘ ĐỒNG BỘ NỀN SIÊU TỐC: TỰ ĐỘNG QUÉT VÀ NẠP NGAY LẬP TỨC (< 1.2S) KỂ CẢ KHI CHUYỂN TAB SANG NƠI KHÁC!
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
    toast?.info?.(\`AI Director đang phân tích đồng thời \${readyFrames.length} cảnh ảnh bằng Gemini Flash...\`);

    const activeGeminiKey = (geminiApiKey || localStorage.getItem('aivideo_gemini_api_key') || DEFAULT_GEMINI_KEY || '').trim();

    // Đưa tất cả các cảnh sẵn sàng sang trạng thái generating
    setStoryboard(prev => prev.map(f => f.imageAsset ? { ...f, videoPromptStatus: "generating" } : f));

    // Chạy song song (Parallel Promise.all) để hoàn thành trong 2-3 giây
    const promises = readyFrames.map(async (frame) => {
      let action = "";
      switch (frame.id) {
        case 1: action = "Excitedly tearing open the black courier bag, plastic rustling sounds, looking at camera with a big closed-mouth smile."; break;
        case 2: action = "Detailed fabric showcase, moving material near lens, showing texture, happy facial expression with mouth closed."; break;
        case 3: action = "Fashion walk towards camera, dynamic stride, confident closed-mouth smile, showing full outfit in motion."; break;
        case 4: action = "Playful 360-degree spin, showing full outfit movement from all angles, dynamic garment drape."; break;
        case 5: action = "Over-the-shoulder gaze, adjusting hair cinematic pose, looking directly at lens with mouth closed."; break;
        case 6: action = "Powerful stance, hair flip, hands on hips fashion movement, subtle body sway highlighting outfit."; break;
        case 7: action = "Friendly wave and exit, soft camera movement follow, stepping back with a genuine closed-mouth smile."; break;
        default: action = "Natural fashion posing movement with mouth strictly closed.";
      }

      try {
        const text = await callGeminiVisionDirector(frame, action, activeGeminiKey);
        if (text) {
          updateFrame(frame.id, { videoPrompt: text, videoPromptStatus: "done" });
        } else {
          updateFrame(frame.id, { videoPromptStatus: "error" });
        }
      } catch (err) {
        console.error(\`Lỗi phân tích Cảnh \${frame.id}:\`, err);
        updateFrame(frame.id, { videoPromptStatus: "error" });
      }
    });

    await Promise.all(promises);
    setIsGeneratingPrompts(false);
    toast?.success?.("Hoàn tất kịch bản chuyển động 100% chuẩn Google Flow cho tất cả cảnh!");
  };

  // 3. Render 1 Video Đơn Lẻ (Image-to-Video Khóa Nhân Vật 100%)
  const generateSingleVideo = async (frameId) => {
    const cs = stateRef.current;
    const frame = cs.storyboard.find(f => f.id === frameId);
    if (!frame || !frame.imageAsset || !frame.videoPrompt) {
      toast?.warn?.(\`Cảnh \${frameId} chưa có ảnh hoặc chưa có kịch bản chuyển động!\`);
      return;
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
      
      // 🎯 ĐẢM BẢO ẢNH CỦA CẢNH NÀY ĐÃ ĐƯỢC ĐĂNG KÝ VÀO ASSET MANAGER LÀM STARTING FRAME
      let validAssetId = await ensureRegisteredAsset(frame.imageAsset, \`koc_scene_\${frameId}.jpg\`);
      if (!validAssetId && frame.imageAsset.assetId) {
        validAssetId = frame.imageAsset.assetId;
      }
      if (!validAssetId) {
        throw new Error("Không thể nạp ảnh Cảnh làm Starting Frame. Vui lòng thử tạo lại ảnh cảnh này!");
      }

      const jobInput = {
        title: \`[KOC Thời Trang] Video Cảnh \${frameId}\`,
        type: "Video",
        providerId: "veo3",
        provider: "Veo3",
        ...(targetAccId ? { accountId: targetAccId } : {}),
        payload: {
          title: \`[KOC Thời Trang] Video Cảnh \${frameId}\`,
          prompt: frame.videoPrompt,
          // 🎯 3 TRƯỜNG CỐT LÕI ĐỂ GOOGLE FLOW VEO 3 KHÓA START FRAME (I2V)
          flowVideoMode: "I2V",
          videoMode: "I2V",
          mode: "I2V",
          referenceAssetIds: [validAssetId],
          inputImageAssetId: validAssetId,
          firstFrameImageMediaId: validAssetId,
          startImageMediaId: validAssetId,
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

  // 🚀 TẠO TOÀN BỘ VIDEO (ĐA LUỒNG SIÊU TỐC - NẠP ĐẦY ĐỦ STARTING FRAME ĐỒNG NHẤT NHÂN VẬT 100%)
  const renderAllVideos = async () => {
    const cs = stateRef.current;
    const targetFrames = cs.storyboard.filter(f => f.imageAsset && f.videoPrompt);
    if (targetFrames.length === 0) {
      toast?.warn?.("Chưa có cảnh nào đủ điều kiện (cần có Ảnh + Kịch bản chuyển động)!");
      return;
    }

    const now = Date.now();
    // ⚡ XÓA SẠCH TOÀN BỘ VIDEO CŨ NGAY KHI PHÁT LỆNH RENDER MỚI!
    setStoryboard(prev => {
      const cleaned = prev.map(f => {
        const isTarget = targetFrames.some(tf => tf.id === f.id);
        if (!isTarget) return f;
        return {
          ...f,
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

        jobs.push({
          title: \`[KOC Thời Trang] Video Cảnh \${frame.id}\`,
          type: "Video",
          providerId: "veo3",
          provider: "Veo3",
          ...(targetAccId ? { accountId: targetAccId } : {}),
          payload: {
            title: \`[KOC Thời Trang] Video Cảnh \${frame.id}\`,
            prompt: frame.videoPrompt,
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

if (code.includes(oldCompStart) && code.includes(oldCompEnd)) {
  const p1 = code.indexOf(oldCompStart);
  const p2 = code.indexOf(oldCompEnd);
  code = code.substring(0, p1) + newCompLogic + code.substring(p2);
  console.log('  ✓ Đã cập nhật xong toàn bộ logic đồng bộ & Image-to-Video');
} else {
  console.warn('  ⚠️ Không tìm thấy vị trí logic component');
}

// 3. Thêm nút "🗑️ Xóa Sạch Dữ Liệu Cũ" vào Sidebar
const oldBtn3 = 'disabled: !storyboard.some(f => f.videoPrompt)\n            }, "Render Toàn bộ Video"),';
const newBtnWithReset = `disabled: !storyboard.some(f => f.videoPrompt)\n            }, "Render Toàn bộ Video"),

            // Button 4: Xóa sạch / Làm mới dữ liệu cũ
            React.createElement("button", {
              type: "button",
              onClick: handleResetAllData,
              className: "w-full py-2.5 px-3 rounded-2xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm mt-1"
            },
              React.createElement("span", null, "🗑️"),
              React.createElement("span", null, "Xóa Sạch Dữ Liệu Cũ")
            ),`;

if (code.includes(oldBtn3)) {
  code = code.replace(oldBtn3, newBtnWithReset);
  console.log('  ✓ Đã thêm nút Xóa Sạch Dữ Liệu Cũ vào Sidebar');
} else {
  console.warn('  ⚠️ Không tìm thấy vị trí nút Button 3');
}

fs.writeFileSync(targetFile, code, 'utf8');
console.log('[*] File size after patch:', code.length);
console.log('💎 HOÀN TẤT PATCH CHO VideoFactoryStudio.js 💎');
