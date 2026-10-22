const fs = require('fs');

const filePath = 'app/out/renderer/assets/VideoFactoryStudio.js';
let content = fs.readFileSync(filePath, 'utf8');

// =========================================================================
// 1. PATCH FASHION SINGLE VIDEO (SingleVideo)
// =========================================================================
const oldSingleVideoRefs = `      // 🎯 ĐĂNG KÝ VÀ LẤY DUY NHẤT ASSET ID CỦA ẢNH CẢNH NÀY (KHÔNG NẠP KOC MẶT HOẶC OUTFIT VÀO ĐÂY)
      let validAssetId = null;
      if (frame.imageAsset) {
        validAssetId = await ensureRegisteredAsset(frame.imageAsset, \`koc_scene_\${frameId}.jpg\`);
        if (!validAssetId && frame.imageAsset.assetId) validAssetId = frame.imageAsset.assetId;
        if (!validAssetId && frame.imageAsset.mediaId) validAssetId = frame.imageAsset.mediaId;
        if (!validAssetId && frame.imageAsset.id) validAssetId = frame.imageAsset.id;
      }

      const modelDisplayName = FASHION_VIDEO_MODELS_MAP[cs.globalVideoModel] || 'Veo 3.1 - Lite [Lower Priority]';

      const jobInput = {
        title: \`[KOC Thời Trang] Video Cảnh \${frameId}\`,
        type: "Video",
        providerId: isMuse ? "muse" : "veo3",
        provider: isMuse ? "Muse AI" : "Veo3",
        ...(targetAccId ? { accountId: targetAccId, account: targetAccName } : {}),
        payload: isMuse ? {
          title: \`[KOC Thời Trang] Video Cảnh \${frameId}\`,
          promptId: \`fashion-scene-\${frameId}\`,
          prompt: promptToSend,
          ratio: "9:16",
          duration: "10s",
          model: "muse-video",
          mode: "Components",
          outputIndex: 0,
          batchSize: 1,
          batchIndex: 0,
          promptOrder: frameId,
          // 🎯 NẠP CẢ ẢNH CẢNH 1 VÀ ẢNH OUTFIT THAM CHIẾU CHO CẢNH 1 ĐỂ KHÓA TRANG PHỤC
          referenceAssetIds: (Number(frameId) === 1 && (cs.outfit?.assetId || cs.outfit?.mediaId || cs.outfit?.id)) ? [validAssetId, cs.outfit?.assetId || cs.outfit?.mediaId || cs.outfit?.id].filter(Boolean) : (validAssetId ? [validAssetId] : []),
          referenceLocalPath: frame?.imageAsset?.localPath || undefined,
          referenceUrl: frame?.imageAsset?.url || undefined,
          resolutionName: cs.videoResolution === '1080p' ? "1080p" : "720p",
          studioSource: "fashion-factory",
          removeWatermark: cs.removeWatermark,
          autoRemoveWatermark: cs.removeWatermark,
          account: targetAccName || (isManual ? undefined : "Auto"),
          accountSelection: isManual ? "manual" : "auto"
        } : {
          title: \`[KOC Thời Trang] Video Cảnh \${frameId}\`,
          prompt: promptToSend,
          flowVideoMode: validAssetId ? "I2V" : "T2V",
          videoMode: validAssetId ? "I2V" : "T2V",
          mode: validAssetId ? "I2V" : "T2V",
          // 🎯 NẠP CẢ ẢNH CẢNH 1 LÀM START FRAME VÀ ẢNH OUTFIT THAM CHIẾU ĐỂ VEO 3 KHÓA TRANG PHỤC
          referenceAssetIds: (Number(frameId) === 1 && (cs.outfit?.assetId || cs.outfit?.mediaId || cs.outfit?.id)) ? [validAssetId, cs.outfit?.assetId || cs.outfit?.mediaId || cs.outfit?.id].filter(Boolean) : (validAssetId ? [validAssetId] : []),
          inputImageAssetId: validAssetId || undefined,
          firstFrameImageMediaId: validAssetId || undefined,
          startImageMediaId: validAssetId || undefined,
          referenceImageMediaIds: (Number(frameId) === 1 && (cs.outfit?.assetId || cs.outfit?.mediaId || cs.outfit?.id)) ? [cs.outfit?.assetId || cs.outfit?.mediaId || cs.outfit?.id] : [],
          model: modelDisplayName,
          modelId: modelDisplayName,
          modelDisplayName: cs.globalVideoModel,
          ratio: "9:16",
          aspectRatio: "9:16",
          duration: "8s",
          durationSeconds: 8,
          studioSource: "fashion-factory",
          autoRemoveWatermark: cs.removeWatermark,
          removeWatermark: cs.removeWatermark,
          upscale1080p: cs.videoResolution === '1080p',
          upsampleResolution: cs.videoResolution,
          resolution: "720p",
          account: targetAccName || (isManual ? undefined : "Auto"),
          accountSelection: isManual ? "manual" : "auto"
        }
      };`;

const newSingleVideoRefs = `      // 🎯 QUY TẮC CỐT LÕI: NẠP ĐỦ 3 ẢNH THAM CHIẾU CHO MỌI CẢNH (ẢNH CẢNH + ẢNH KOC MẪU + ẢNH OUTFIT)
      let validAssetId = null;
      if (frame.imageAsset) {
        validAssetId = await ensureRegisteredAsset(frame.imageAsset, \`koc_scene_\${frameId}.jpg\`);
        if (!validAssetId && frame.imageAsset.assetId) validAssetId = frame.imageAsset.assetId;
        if (!validAssetId && frame.imageAsset.mediaId) validAssetId = frame.imageAsset.mediaId;
        if (!validAssetId && frame.imageAsset.id) validAssetId = frame.imageAsset.id;
      }
      const validKocId = cs.koc ? await ensureRegisteredAsset(cs.koc, 'koc_model_face.jpg') : null;
      const validOutfitId = cs.outfit ? await ensureRegisteredAsset(cs.outfit, 'outfit_sample.jpg') : null;
      const sceneRefIds = [validAssetId, validKocId, validOutfitId].filter(Boolean);

      const modelDisplayName = FASHION_VIDEO_MODELS_MAP[cs.globalVideoModel] || 'Veo 3.1 - Lite [Lower Priority]';

      const jobInput = {
        title: \`[KOC Thời Trang] Video Cảnh \${frameId}\`,
        type: "Video",
        providerId: isMuse ? "muse" : "veo3",
        provider: isMuse ? "Muse AI" : "Veo3",
        autoRemoveWatermark: true,
        removeWatermark: true,
        ...(targetAccId ? { accountId: targetAccId, account: targetAccName } : {}),
        payload: isMuse ? {
          title: \`[KOC Thời Trang] Video Cảnh \${frameId}\`,
          promptId: \`fashion-scene-\${frameId}\`,
          prompt: promptToSend,
          ratio: "9:16",
          duration: "10s",
          model: "muse-video",
          mode: "Components",
          outputIndex: 0,
          batchSize: 1,
          batchIndex: 0,
          promptOrder: frameId,
          referenceAssetIds: sceneRefIds,
          referenceLocalPath: frame?.imageAsset?.localPath || undefined,
          referenceUrl: frame?.imageAsset?.url || undefined,
          resolutionName: cs.videoResolution === '1080p' ? "1080p" : "720p",
          studioSource: "fashion-factory",
          removeWatermark: true,
          autoRemoveWatermark: true,
          account: targetAccName || (isManual ? undefined : "Auto"),
          accountSelection: isManual ? "manual" : "auto"
        } : {
          title: \`[KOC Thời Trang] Video Cảnh \${frameId}\`,
          prompt: promptToSend,
          flowVideoMode: validAssetId ? "I2V" : "T2V",
          videoMode: validAssetId ? "I2V" : "T2V",
          mode: validAssetId ? "I2V" : "T2V",
          referenceAssetIds: sceneRefIds,
          inputImageAssetId: validAssetId || undefined,
          firstFrameImageMediaId: validAssetId || undefined,
          startImageMediaId: validAssetId || undefined,
          referenceImageMediaIds: [validKocId, validOutfitId].filter(Boolean),
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
          upscale1080p: cs.videoResolution === '1080p',
          upsampleResolution: cs.videoResolution,
          resolution: "720p",
          account: targetAccName || (isManual ? undefined : "Auto"),
          accountSelection: isManual ? "manual" : "auto"
        }
      };`;

if (!content.includes(oldSingleVideoRefs)) {
  console.error("oldSingleVideoRefs NOT FOUND!");
  process.exit(1);
}
content = content.replace(oldSingleVideoRefs, newSingleVideoRefs);
console.log("Patched 1: Fashion Single Video references and watermark!");

// =========================================================================
// 2. PATCH FASHION BATCH VIDEO (renderAllVideos)
// =========================================================================
const oldBatchVideoRefs = `        // 🎯 ĐĂNG KÝ VÀ LẤY DUY NHẤT ASSET ID CỦA ẢNH CẢNH NÀY (KHÔNG NẠP KOC FACE HOẶC OUTFIT VÀO ĐÂY)
        let validAssetId = null;
        if (frame.imageAsset) {
          validAssetId = await ensureRegisteredAsset(frame.imageAsset, \`koc_scene_\${frame.id}.jpg\`);
          if (!validAssetId && frame.imageAsset.assetId) validAssetId = frame.imageAsset.assetId;
          if (!validAssetId && frame.imageAsset.mediaId) validAssetId = frame.imageAsset.mediaId;
          if (!validAssetId && frame.imageAsset.id) validAssetId = frame.imageAsset.id;
        }

        const promptToSend = frame.videoPrompt || getSmartMotionPrompt(frame.id, cs.creativeDirection, cs.outfit?.name || cs.outfit?.productName || cs.outfitName);

        jobs.push({
          title: \`[KOC Thời Trang] Video Cảnh \${frame.id}\`,
          type: "Video",
          providerId: isMuse ? "muse" : "veo3",
          provider: isMuse ? "Muse AI" : "Veo3",
          ...(targetAccId ? { accountId: targetAccId, account: targetAccName } : {}),
          payload: isMuse ? {
            title: \`[KOC Thời Trang] Video Cảnh \${frame.id}\`,
            promptId: \`fashion-scene-\${frame.id}\`,
            prompt: promptToSend,
            ratio: "9:16",
            duration: "10s",
            model: "muse-video",
            mode: "Components",
            outputIndex: idx,
            batchSize: targetFrames.length,
            generationRunId: runId,
            generationRunCreatedAt: runCreatedAt,
            promptOrder: frame.id,
            batchIndex: idx,
            // 🎯 NẠP CẢ ẢNH CẢNH 1 VÀ ẢNH OUTFIT THAM CHIẾU ĐỂ KHÓA TRANG PHỤC CẢNH 1
            referenceAssetIds: (Number(frame.id) === 1 && (cs.outfit?.assetId || cs.outfit?.mediaId || cs.outfit?.id)) ? [validAssetId, cs.outfit?.assetId || cs.outfit?.mediaId || cs.outfit?.id].filter(Boolean) : (validAssetId ? [validAssetId] : []),
            referenceLocalPath: frame?.imageAsset?.localPath || undefined,
            referenceUrl: frame?.imageAsset?.url || undefined,
            resolutionName: cs.videoResolution === '1080p' ? "1080p" : "720p",
            studioSource: "fashion-factory",
            removeWatermark: cs.removeWatermark,
            autoRemoveWatermark: cs.removeWatermark,
            account: targetAccName || (isManual ? undefined : "Auto"),
            accountSelection: isManual ? "manual" : "auto"
          } : {
            title: \`[KOC Thời Trang] Video Cảnh \${frame.id}\`,
            prompt: promptToSend,
            flowVideoMode: validAssetId ? "I2V" : "T2V",
            videoMode: validAssetId ? "I2V" : "T2V",
            mode: validAssetId ? "I2V" : "T2V",
            // 🎯 NẠP CẢ ẢNH CẢNH 1 LÀM START FRAME VÀ ẢNH OUTFIT THAM CHIẾU ĐỂ VEO 3 KHÓA TRANG PHỤC
            referenceAssetIds: (Number(frame.id) === 1 && (cs.outfit?.assetId || cs.outfit?.mediaId || cs.outfit?.id)) ? [validAssetId, cs.outfit?.assetId || cs.outfit?.mediaId || cs.outfit?.id].filter(Boolean) : (validAssetId ? [validAssetId] : []),
            inputImageAssetId: validAssetId || undefined,
            firstFrameImageMediaId: validAssetId || undefined,
            startImageMediaId: validAssetId || undefined,
            referenceImageMediaIds: (Number(frame.id) === 1 && (cs.outfit?.assetId || cs.outfit?.mediaId || cs.outfit?.id)) ? [cs.outfit?.assetId || cs.outfit?.mediaId || cs.outfit?.id] : [],
            model: modelDisplayName,
            modelId: modelDisplayName,
            modelDisplayName: cs.globalVideoModel,
            ratio: "9:16",
            aspectRatio: "9:16",
            duration: "8s",
            durationSeconds: 8,
            studioSource: "fashion-factory",
            autoRemoveWatermark: cs.removeWatermark,
            removeWatermark: cs.removeWatermark,
            upscale1080p: cs.videoResolution === '1080p',
            upsampleResolution: cs.videoResolution,
            resolution: "720p",
            account: targetAccName || (isManual ? undefined : "Auto"),
            accountSelection: isManual ? "manual" : "auto"
          }
        });`;

const newBatchVideoRefs = `        // 🎯 QUY TẮC CỐT LÕI: NẠP ĐỦ 3 ẢNH THAM CHIẾU CHO MỌI CẢNH (ẢNH CẢNH + ẢNH KOC MẪU + ẢNH OUTFIT)
        let validAssetId = null;
        if (frame.imageAsset) {
          validAssetId = await ensureRegisteredAsset(frame.imageAsset, \`koc_scene_\${frame.id}.jpg\`);
          if (!validAssetId && frame.imageAsset.assetId) validAssetId = frame.imageAsset.assetId;
          if (!validAssetId && frame.imageAsset.mediaId) validAssetId = frame.imageAsset.mediaId;
          if (!validAssetId && frame.imageAsset.id) validAssetId = frame.imageAsset.id;
        }
        const validKocId = cs.koc ? await ensureRegisteredAsset(cs.koc, 'koc_model_face.jpg') : null;
        const validOutfitId = cs.outfit ? await ensureRegisteredAsset(cs.outfit, 'outfit_sample.jpg') : null;
        const sceneRefIds = [validAssetId, validKocId, validOutfitId].filter(Boolean);

        const promptToSend = frame.videoPrompt || getSmartMotionPrompt(frame.id, cs.creativeDirection, cs.outfit?.name || cs.outfit?.productName || cs.outfitName);

        jobs.push({
          title: \`[KOC Thời Trang] Video Cảnh \${frame.id}\`,
          type: "Video",
          providerId: isMuse ? "muse" : "veo3",
          provider: isMuse ? "Muse AI" : "Veo3",
          autoRemoveWatermark: true,
          removeWatermark: true,
          ...(targetAccId ? { accountId: targetAccId, account: targetAccName } : {}),
          payload: isMuse ? {
            title: \`[KOC Thời Trang] Video Cảnh \${frame.id}\`,
            promptId: \`fashion-scene-\${frame.id}\`,
            prompt: promptToSend,
            ratio: "9:16",
            duration: "10s",
            model: "muse-video",
            mode: "Components",
            outputIndex: idx,
            batchSize: targetFrames.length,
            generationRunId: runId,
            generationRunCreatedAt: runCreatedAt,
            promptOrder: frame.id,
            batchIndex: idx,
            referenceAssetIds: sceneRefIds,
            referenceLocalPath: frame?.imageAsset?.localPath || undefined,
            referenceUrl: frame?.imageAsset?.url || undefined,
            resolutionName: cs.videoResolution === '1080p' ? "1080p" : "720p",
            studioSource: "fashion-factory",
            removeWatermark: true,
            autoRemoveWatermark: true,
            account: targetAccName || (isManual ? undefined : "Auto"),
            accountSelection: isManual ? "manual" : "auto"
          } : {
            title: \`[KOC Thời Trang] Video Cảnh \${frame.id}\`,
            prompt: promptToSend,
            flowVideoMode: validAssetId ? "I2V" : "T2V",
            videoMode: validAssetId ? "I2V" : "T2V",
            mode: validAssetId ? "I2V" : "T2V",
            referenceAssetIds: sceneRefIds,
            inputImageAssetId: validAssetId || undefined,
            firstFrameImageMediaId: validAssetId || undefined,
            startImageMediaId: validAssetId || undefined,
            referenceImageMediaIds: [validKocId, validOutfitId].filter(Boolean),
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
            upscale1080p: cs.videoResolution === '1080p',
            upsampleResolution: cs.videoResolution,
            resolution: "720p",
            account: targetAccName || (isManual ? undefined : "Auto"),
            accountSelection: isManual ? "manual" : "auto"
          }
        });`;

if (!content.includes(oldBatchVideoRefs)) {
  console.error("oldBatchVideoRefs NOT FOUND!");
  process.exit(1);
}
content = content.replace(oldBatchVideoRefs, newBatchVideoRefs);
console.log("Patched 2: Fashion Batch Video references and watermark!");

// =========================================================================
// 3. PATCH XƯỞNG ĐA NGÀNH SINGLE VIDEO (handleGenerateVideo)
// =========================================================================
const oldDaNganhSingle = `      // 🎯 NẠP ĐẦY ĐỦ ASSET IDS THAM CHIẾU THEO TỪNG XƯỞNG
      let allRefIds = [];
      if (currentNiche === 'household') {
        // XƯỞNG GIA DỤNG: 1 Ảnh Showroom Cảnh + 2 Ảnh Tham Chiếu (Mẫu KOC + Đồ Gia Dụng)
        const validShowroomId = scene.showroomImage ? await ensureRegisteredAsset(scene.showroomImage, \`household_showroom_scene_\${scene.id}.jpg\`) : null;
        const validKocId = kocImage ? await ensureRegisteredAsset(kocImage, 'household_koc.jpg') : null;
        const primaryProduct = (products || []).find(p => p);
        const validProductId = primaryProduct ? await ensureRegisteredAsset(primaryProduct, 'household_product.jpg') : null;
        allRefIds = [validShowroomId, validKocId, validProductId].filter(Boolean);
      } else {
        // CÁC XƯỞNG KHÁC GIỮ NGUYÊN 100% KHÔNG CHẠM VÀO
        let targetRefAssetId = scene.showroomImage?.assetId;
        if (!targetRefAssetId && scene.showroomImage?.url) {
          const matched = (allAssets || []).find(a => a.url === scene.showroomImage.url || a.thumbnailUrl === scene.showroomImage.url);
          if (matched?.id) targetRefAssetId = matched.id;
        }
        if (targetRefAssetId) allRefIds.push(targetRefAssetId);
        if (kocImage?.assetId && !allRefIds.includes(kocImage.assetId)) allRefIds.push(kocImage.assetId);
        (products || []).forEach(p => {
          if (p?.assetId && !allRefIds.includes(p.assetId)) allRefIds.push(p.assetId);
        });
      }
      const hasRef = allRefIds.length > 0;`;

const newDaNganhSingle = `      // 🎯 QUY TẮC CỐT LÕI MỌI CẢNH: ẢNH SHOWROOM CẢNH + ẢNH KOC MẪU + ẢNH OUTFIT/SẢN PHẨM
      const validShowroomId = scene.showroomImage ? await ensureRegisteredAsset(scene.showroomImage, \`scene_\${scene.id}_showroom.jpg\`) : null;
      const validKocId = kocImage ? await ensureRegisteredAsset(kocImage, 'koc_model_ref.jpg') : null;
      const primaryProduct = (products || []).find(p => p);
      const validProductId = primaryProduct ? await ensureRegisteredAsset(primaryProduct, 'outfit_product_ref.jpg') : null;
      const allRefIds = [validShowroomId, validKocId, validProductId].filter(Boolean);
      const hasRef = allRefIds.length > 0;`;

if (!content.includes(oldDaNganhSingle)) {
  console.error("oldDaNganhSingle NOT FOUND!");
  process.exit(1);
}
content = content.replace(oldDaNganhSingle, newDaNganhSingle);
console.log("Patched 3: Xưởng Đa Ngành Single Video references!");

// Also patch referenceAssetIds for DaNganh single video
const oldSinglePayloadRef = `referenceAssetIds: hasRef ? (currentNiche === 'household' ? allRefIds.slice(0, 3) : [allRefIds[0]]) : [],`;
if (content.includes(oldSinglePayloadRef)) {
  content = content.replace(oldSinglePayloadRef, `referenceAssetIds: allRefIds.slice(0, 3),
            inputImageAssetId: validShowroomId || undefined,
            firstFrameImageMediaId: validShowroomId || undefined,
            startImageMediaId: validShowroomId || undefined,
            referenceImageMediaIds: [validKocId, validProductId].filter(Boolean),
            autoRemoveWatermark: true,
            removeWatermark: true,`);
  console.log("Patched 3b: Xưởng Đa Ngành Single Video payload references!");
}

// =========================================================================
// 4. PATCH XƯỞNG ĐA NGÀNH BATCH VIDEO (handleGenerateAllVideos)
// =========================================================================
const oldDaNganhBatch = `          // 🎯 NẠP ĐẦY ĐỦ ASSET IDS THAM CHIẾU THEO TỪNG XƯỞNG
          let allRefIds = [];
          if (currentNiche === 'household') {
            // XƯỞNG GIA DỤNG: 1 Ảnh Showroom Cảnh + 2 Ảnh Tham Chiếu (Mẫu KOC + Đồ Gia Dụng)
            const validShowroomId = scene.showroomImage ? await ensureRegisteredAsset(scene.showroomImage, \`household_showroom_scene_\${scene.id}.jpg\`) : null;
            const validKocId = kocImage ? await ensureRegisteredAsset(kocImage, 'household_koc.jpg') : null;
            const primaryProduct = (products || []).find(p => p);
            const validProductId = primaryProduct ? await ensureRegisteredAsset(primaryProduct, 'household_product.jpg') : null;
            allRefIds = [validShowroomId, validKocId, validProductId].filter(Boolean);
          } else {
            // CÁC XƯỞNG KHÁC GIỮ NGUYÊN 100% KHÔNG CHẠM VÀO
            let targetRefAssetId = scene.showroomImage?.assetId;
            if (!targetRefAssetId && scene.showroomImage?.url) {
              const matched = (allAssets || []).find(a => a.url === scene.showroomImage.url || a.thumbnailUrl === scene.showroomImage.url);
              if (matched?.id) targetRefAssetId = matched.id;
            }
            if (targetRefAssetId) allRefIds.push(targetRefAssetId);
            if (kocImage?.assetId && !allRefIds.includes(kocImage.assetId)) allRefIds.push(kocImage.assetId);
            (products || []).forEach(p => {
              if (p?.assetId && !allRefIds.includes(p.assetId)) allRefIds.push(p.assetId);
            });
          }
          const hasRef = allRefIds.length > 0;`;

const newDaNganhBatch = `          // 🎯 QUY TẮC CỐT LÕI MỌI CẢNH: ẢNH SHOWROOM CẢNH + ẢNH KOC MẪU + ẢNH OUTFIT/SẢN PHẨM
          const validShowroomId = scene.showroomImage ? await ensureRegisteredAsset(scene.showroomImage, \`scene_\${scene.id}_showroom.jpg\`) : null;
          const validKocId = kocImage ? await ensureRegisteredAsset(kocImage, 'koc_model_ref.jpg') : null;
          const primaryProduct = (products || []).find(p => p);
          const validProductId = primaryProduct ? await ensureRegisteredAsset(primaryProduct, 'outfit_product_ref.jpg') : null;
          const allRefIds = [validShowroomId, validKocId, validProductId].filter(Boolean);
          const hasRef = allRefIds.length > 0;`;

if (!content.includes(oldDaNganhBatch)) {
  console.error("oldDaNganhBatch NOT FOUND!");
  process.exit(1);
}
content = content.replace(oldDaNganhBatch, newDaNganhBatch);
console.log("Patched 4: Xưởng Đa Ngành Batch Video references!");

// Also patch referenceAssetIds for DaNganh batch video
if (content.includes(oldSinglePayloadRef)) {
  content = content.replace(oldSinglePayloadRef, `referenceAssetIds: allRefIds.slice(0, 3),
              inputImageAssetId: validShowroomId || undefined,
              firstFrameImageMediaId: validShowroomId || undefined,
              startImageMediaId: validShowroomId || undefined,
              referenceImageMediaIds: [validKocId, validProductId].filter(Boolean),
              autoRemoveWatermark: true,
              removeWatermark: true,`);
  console.log("Patched 4b: Xưởng Đa Ngành Batch Video payload references!");
}

// =========================================================================
// 5. ƯU TIÊN BẢN SẠCH LOCALPATH KHI HIỂN THỊ SHOWROOM & VIDEO
// =========================================================================
// In checkJobsAndAssets:
const oldShowroomBestUrl = `const bestUrl = matchedAsset.thumbnailUrl || matchedAsset.url || (matchedAsset.localPath ? 'file:///' + matchedAsset.localPath.replace(/\\\\/g, '/') : '');`;
const newShowroomBestUrl = `const bestUrl = (matchedAsset.localPath ? 'file:///' + matchedAsset.localPath.replace(/\\\\/g, '/') : '') || matchedAsset.url || matchedAsset.thumbnailUrl || '';`;

if (content.includes(oldShowroomBestUrl)) {
  content = content.replace(oldShowroomBestUrl, newShowroomBestUrl);
  console.log("Patched 5a: Showroom bestUrl prefers clean localPath!");
}

const oldFallbackShowroomBestUrl = `const bestUrl = fallbackAsset.thumbnailUrl || fallbackAsset.url || (fallbackAsset.localPath ? 'file:///' + fallbackAsset.localPath.replace(/\\\\/g, '/') : '');`;
const newFallbackShowroomBestUrl = `const bestUrl = (fallbackAsset.localPath ? 'file:///' + fallbackAsset.localPath.replace(/\\\\/g, '/') : '') || fallbackAsset.url || fallbackAsset.thumbnailUrl || '';`;

if (content.includes(oldFallbackShowroomBestUrl)) {
  content = content.replace(oldFallbackShowroomBestUrl, newFallbackShowroomBestUrl);
  console.log("Patched 5b: Fallback showroom bestUrl prefers clean localPath!");
}

const oldVideoBestUrl = `const bestUrl = matchedVideoAsset.url || (matchedVideoAsset.localPath ? 'file:///' + matchedVideoAsset.localPath.replace(/\\\\/g, '/') : '');`;
const newVideoBestUrl = `const bestUrl = (matchedVideoAsset.localPath ? 'file:///' + matchedVideoAsset.localPath.replace(/\\\\/g, '/') : '') || matchedVideoAsset.url || '';`;

if (content.includes(oldVideoBestUrl)) {
  content = content.replace(oldVideoBestUrl, newVideoBestUrl);
  console.log("Patched 5c: Video bestUrl prefers clean localPath!");
}

const oldFallbackVideoBestUrl = `const bestUrl = fallbackVideo.url || (fallbackVideo.localPath ? 'file:///' + fallbackVideo.localPath.replace(/\\\\/g, '/') : '');`;
const newFallbackVideoBestUrl = `const bestUrl = (fallbackVideo.localPath ? 'file:///' + fallbackVideo.localPath.replace(/\\\\/g, '/') : '') || fallbackVideo.url || '';`;

if (content.includes(oldFallbackVideoBestUrl)) {
  content = content.replace(oldFallbackVideoBestUrl, newFallbackVideoBestUrl);
  console.log("Patched 5d: Fallback video bestUrl prefers clean localPath!");
}

fs.writeFileSync(filePath, content, 'utf8');
console.log("All patches applied to VideoFactoryStudio.js successfully!");
