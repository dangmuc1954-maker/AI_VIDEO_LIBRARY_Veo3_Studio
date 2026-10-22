const fs = require('fs');

const targetFile = 'app/out/renderer/assets/VideoFactoryStudio.js';
let code = fs.readFileSync(targetFile, 'utf8');

// Backup
fs.writeFileSync(targetFile + '.bak_before_ref_fix', code, 'utf8');
console.log('[BACKUP] Created:', targetFile + '.bak_before_ref_fix');

// =========================================================================
// 1. Update analyzeKocDetails to stop suggesting blazer/jacket
// =========================================================================
const oldAnalyzeDesc = `"outfitDesc": "concise description of the exact clothes they wear (color, jacket/blazer/suit/shirt, sleeves, collar, inner top), e.g. 'wearing an elegant dark charcoal grey tailored blazer jacket over a clean white top with identical dark sleeves and collar'",`;
const newAnalyzeDesc = `"outfitDesc": "concise description of the exact clothing they wear (colors, style, sleeves, collar, neckline, pattern) - 100% exact replica of the reference photo, e.g. 'wearing the exact same clothing from reference photo with identical collar, sleeves, and style, NO blazer or jacket unless clearly visible in photo'",`;

if (code.includes(oldAnalyzeDesc)) {
  code = code.replace(oldAnalyzeDesc, newAnalyzeDesc);
  console.log('[1/5] Updated analyzeKocDetails description');
} else {
  console.log('[WARN 1/5] oldAnalyzeDesc not found directly');
}

// =========================================================================
// 2. Update getEffectiveKocProfile to remove hardcoded tailored jacket/blazer
// =========================================================================
const oldGetEffProfile = `function getEffectiveKocProfile(kocImg, profile, voice) {
  if (profile && profile.gender) {
    return profile;
  }
  const isFemale = kocImg?.profile?.isFemale ?? (!voice || !voice.includes('Nam'));
  return {
    gender: isFemale ? 'female' : 'male',
    isFemale: isFemale,
    presenterNoun: isFemale ? 'attractive young Asian female presenter' : 'handsome young Asian male presenter',
    outfitDesc: kocImg 
      ? 'wearing the EXACT SAME outfit from the original KOC photo with matching tailored jacket/blazer and identical sleeves' 
      : 'wearing an elegant tailored business blazer over a clean top',
    expression: 'beaming radiant commercial smile, energetic fresh confident expression looking directly at camera'
  };
}`;

const newGetEffProfile = `function getEffectiveKocProfile(kocImg, profile, voice) {
  if (profile && profile.gender) {
    const isFem = profile.gender.toLowerCase().includes('female') || profile.gender.toLowerCase().includes('woman') || profile.gender.toLowerCase().includes('nữ');
    const cleanOutfit = profile.outfitDesc ? profile.outfitDesc.replace(/tailored (jacket|blazer)|business blazer/gi, 'clothing from reference photo') : '';
    return {
      ...profile,
      isFemale: isFem,
      presenterNoun: isFem ? 'attractive young Asian female presenter' : 'handsome young Asian male presenter',
      outfitDesc: cleanOutfit || (kocImg 
        ? 'wearing the EXACT SAME outfit and clothing as shown in the reference photo (identical style, neckline, sleeves, and colors - 100% exact 1:1 match with NO jacket/blazer unless shown in photo)' 
        : 'wearing clean commercial clothing matching the reference photo'),
      expression: 'beaming radiant commercial smile, energetic fresh confident expression looking directly at camera'
    };
  }
  const isFemale = kocImg?.profile?.isFemale ?? (!voice || !voice.includes('Nam'));
  return {
    gender: isFemale ? 'female' : 'male',
    isFemale: isFemale,
    presenterNoun: isFemale ? 'attractive young Asian female presenter' : 'handsome young Asian male presenter',
    outfitDesc: kocImg 
      ? 'wearing the EXACT SAME outfit and clothing as shown in the reference photo (identical style, neckline, sleeves, and colors - 100% exact 1:1 match with NO jacket/blazer unless shown in photo)' 
      : 'wearing clean commercial clothing matching the reference photo',
    expression: 'beaming radiant commercial smile, energetic fresh confident expression looking directly at camera'
  };
}`;

if (code.includes(oldGetEffProfile)) {
  code = code.replace(oldGetEffProfile, newGetEffProfile);
  console.log('[2/5] Updated getEffectiveKocProfile to eliminate blazer/jacket');
} else {
  console.log('[WARN 2/5] oldGetEffProfile not matched directly, using index slice');
  const startIdx = code.indexOf('function getEffectiveKocProfile(');
  const endIdx = code.indexOf('// TẠO PROMPT VIDEO NÂNG CAO CHO MODEL VEO', startIdx);
  if (startIdx !== -1 && endIdx !== -1) {
    code = code.slice(0, startIdx) + newGetEffProfile + '\n\n' + code.slice(endIdx);
    console.log('[2/5] Replaced getEffectiveKocProfile via slice');
  }
}

// =========================================================================
// 3. Update buildEnhancedVideoPrompt to animate showroom image directly & remove blazer
// =========================================================================
const oldBuildEnhanced = `function buildEnhancedVideoPrompt(scene, totalScenes = 3, kocProfile = null, hasKocImage = false, voiceLabel = '') {
  const isFirstScene = scene.id === 1;
  const isLastScene = scene.id === totalScenes;
  const rawMotion = (scene.motionPrompt || '').trim().replace(/\\.+$/, '');

  const isFem = kocProfile?.isFemale ?? (!voiceLabel || !voiceLabel.includes('Nam'));
  const presWord = isFem ? "attractive Asian female presenter" : "handsome Asian male presenter";
  const outfitWord = hasKocImage 
    ? (kocProfile?.outfitDesc ? \`wearing \${kocProfile.outfitDesc}\` : "wearing the EXACT SAME outfit from the original KOC photo with identical sleeves")
    : "wearing an elegant tailored business blazer over a clean top";

  if (isFirstScene) {
    return \`A sleek commercial video opening, steady medium shot: \${rawMotion ? rawMotion + '. ' : ''}The SAME \${presWord} \${outfitWord} gracefully showcases the featured product inside a bright modern showroom with a radiant, confident commercial smile. 100% consistent character identity and wardrobe lock, steady locked cinematic camera, soft diffused studio lighting, high production value, pristine 4k commercial quality.\`;
  } else if (isLastScene) {
    return \`A high-converting commercial closing clip, steady medium framing: \${rawMotion ? rawMotion + '. ' : ''}The SAME \${presWord} \${outfitWord} proudly presents the product while gesturing warmly towards the bottom-left shopping area in the bright modern showroom with an inviting, radiant commercial smile. 100% consistent character identity and wardrobe lock, steady locked framing, natural soft lighting, 4k commercial finish.\`;
  } else {
    // Phân cảnh quay cận review công dụng & chức năng sản phẩm
    return \`A premium macro commercial product video: \${rawMotion ? rawMotion + '. ' : ''}Crisp close-up focus on the product features and utility in action, smoothly operated by the hands of the SAME \${presWord} wearing identical sleeves matching the KOC outfit. 100% consistent character identity, presenter's radiant smile visible in soft background bokeh, steady cinematic camera without spinning, soft studio lighting, pristine 4k.\`;
  }
}`;

const newBuildEnhanced = `function buildEnhancedVideoPrompt(scene, totalScenes = 3, kocProfile = null, hasKocImage = false, voiceLabel = '') {
  const isFirstScene = scene.id === 1;
  const isLastScene = scene.id === totalScenes;
  const rawMotion = (scene.motionPrompt || '').trim().replace(/\\.+$/, '');

  const isFem = kocProfile?.isFemale ?? (!voiceLabel || !voiceLabel.includes('Nam'));
  const presWord = isFem ? "attractive Asian female presenter" : "handsome Asian male presenter";
  const outfitWord = hasKocImage 
    ? (kocProfile?.outfitDesc 
        ? \`wearing \${kocProfile.outfitDesc.replace(/tailored (jacket|blazer)|business blazer/gi, 'clothing from reference photo')}\` 
        : "wearing the EXACT SAME outfit and clothing as shown in the reference photo (identical style, neckline, sleeves, and colors - 100% exact 1:1 match with NO jacket/blazer unless shown in photo)")
    : "wearing clean commercial clothing matching the reference photo";

  const hasShowroom = Boolean(scene.showroomImage);
  const refContext = hasShowroom 
    ? "Directly animating the exact scene, presenter, and outfit shown in reference image #1. " 
    : "";

  if (isFirstScene) {
    return \`A sleek commercial video opening, steady medium shot: \${rawMotion ? rawMotion + '. ' : ''}\${refContext}The SAME \${presWord} \${outfitWord} gracefully showcases the featured product inside a bright modern showroom with a radiant, confident commercial smile. 100% consistent character identity and wardrobe lock, steady locked cinematic camera, soft diffused studio lighting, high production value, pristine 4k commercial quality.\`;
  } else if (isLastScene) {
    return \`A high-converting commercial closing clip, steady medium framing: \${rawMotion ? rawMotion + '. ' : ''}\${refContext}The SAME \${presWord} \${outfitWord} proudly presents the product while gesturing warmly towards the bottom-left shopping area in the bright modern showroom with an inviting, radiant commercial smile. 100% consistent character identity and wardrobe lock, steady locked framing, natural soft lighting, 4k commercial finish.\`;
  } else {
    return \`A premium macro commercial product video: \${rawMotion ? rawMotion + '. ' : ''}\${refContext}Crisp close-up focus on the product features and utility in action, smoothly operated by the hands of the SAME \${presWord} wearing identical sleeves matching the reference outfit. 100% consistent character identity, presenter's radiant smile visible in soft background bokeh, steady cinematic camera without spinning, soft studio lighting, pristine 4k.\`;
  }
}`;

if (code.includes(oldBuildEnhanced)) {
  code = code.replace(oldBuildEnhanced, newBuildEnhanced);
  console.log('[3/5] Updated buildEnhancedVideoPrompt');
} else {
  console.log('[WARN 3/5] oldBuildEnhanced not matched directly, using index slice');
  const startIdx = code.indexOf('function buildEnhancedVideoPrompt(');
  const endIdx = code.indexOf('// BỘ GIỌNG ĐỌC KOC CHUẨN THƯƠNG MẠI', startIdx);
  if (startIdx !== -1 && endIdx !== -1) {
    code = code.slice(0, startIdx) + newBuildEnhanced + '\n\n' + code.slice(endIdx);
    console.log('[3/5] Replaced buildEnhancedVideoPrompt via slice');
  }
}

// =========================================================================
// 4. Update handleGenerateScript: Strict outfit lock instruction + multimodal reference images
// =========================================================================
const oldAnalysisRules = `3. ĐỒNG NHẤT NHÂN VẬT & KHÓA TRANG PHỤC (100% SAME OUTFIT LOCK):
- Tất cả các cảnh đều thuộc về CÙNG MỘT NHÂN VẬT mặc CÙNG MỘT BỘ ĐỒ DUY NHẤT (The SAME presenter (\${effProfile.presenterNoun}) wearing the EXACT SAME outfit as the original KOC photo (\${effProfile.outfitDesc}) with a radiant smiling expression throughout all scenes). Tuyệt đối không thay đổi quần áo hay đổi người.`;

const newAnalysisRules = `3. ĐỒNG NHẤT NHÂN VẬT & KHÓA TRANG PHỤC TUYỆT ĐỐI (100% STRICT REFERENCE OUTFIT LOCK):
- Tất cả các cảnh đều thuộc về CÙNG MỘT NHÂN VẬT mặc CÙNG MỘT BỘ ĐỒ DUY NHẤT lấy chính xác 100% từ ảnh tham chiếu KOC: The SAME presenter (\${effProfile.presenterNoun}) wearing the EXACT SAME outfit and clothing as shown in the reference photo (identical style, neckline, sleeves, and colors - 100% exact 1:1 match).
- 🚨 CẢNH BÁO QUAN TRỌNG VỀ TRANG PHỤC: TUYỆT ĐỐI CẤM TỰ Ý MÔ TẢ MẶC VEST, BLAZER, JACKET, ÁO VÉC NẾU NHÂN VẬT TRONG ẢNH KHÔNG MẶC VEST! Nhân vật mặc gì trong ảnh tham chiếu thì motionPrompt PHẢI khóa y nguyên trang phục đó (ví dụ áo thun, áo sơ mi, đầm, áo polo,...), KHÔNG thêm áo khoác/vest/blazer vào prompt!`;

if (code.includes(oldAnalysisRules)) {
  code = code.replace(oldAnalysisRules, newAnalysisRules);
  console.log('[4a/5] Updated analysisPrompt rules');
} else {
  console.log('[WARN 4a/5] oldAnalysisRules not matched directly');
}

// Ensure multiple reference images (KOC + Showroom + Product) are sent to Gemini in handleGenerateScript
const oldScriptImgHandling = `      // Chuẩn hóa Base64 an toàn
      let validImgData = null;
      try {
        const activeSceneImg = scenes[activePreviewIndex]?.showroomImage;
        const targetImg = kocImage || activeSceneImg || products.find(p => p !== null);
        if (targetImg) {
          if (typeof targetImg.base64 === 'string' && targetImg.base64.startsWith('data:image')) {
            const spl = targetImg.base64.split(',');
            if (spl[1] && spl[1].length > 100) {
              const mime = targetImg.base64.match(/data:([^;]+);/)?.[1] || targetImg.mimeType || 'image/jpeg';
              validImgData = { data: spl[1], mimeType: mime };
            }
          }
          if (!validImgData) {
            const urlToFetch = targetImg.url || (typeof targetImg.base64 === 'string' && (targetImg.base64.startsWith('http') || targetImg.base64.includes('window-asset')) ? targetImg.base64 : null);
            if (urlToFetch) {
              const imgRes = await fetch(urlToFetch);
              if (imgRes.ok) {
                const blob = await imgRes.blob();
                const converted = await new Promise((res) => {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    const str = reader.result;
                    if (typeof str === 'string' && str.includes(',')) {
                      res({ data: str.split(',')[1], mimeType: blob.type || targetImg.mimeType || 'image/jpeg' });
                    } else {
                      res(null);
                    }
                  };
                  reader.onerror = () => res(null);
                  reader.readAsDataURL(blob);
                });
                if (converted && converted.data && converted.data.length > 100) {
                  validImgData = converted;
                }
              }
            }
          }
          if (!validImgData && Array.isArray(products)) {
            const prodImg = products.find(p => p && typeof p.base64 === 'string' && p.base64.startsWith('data:image'));
            if (prodImg) {
              const spl = prodImg.base64.split(',');
              if (spl[1] && spl[1].length > 100) {
                const mime = prodImg.base64.match(/data:([^;]+);/)?.[1] || prodImg.mimeType || 'image/jpeg';
                validImgData = { data: spl[1], mimeType: mime };
              }
            }
          }
        }
      } catch(e) {}

      const parts = [{ text: analysisPrompt }];
      if (validImgData && validImgData.data) {
        parts.unshift({
          inline_data: {
            mime_type: validImgData.mimeType || 'image/jpeg',
            data: validImgData.data
          }
        });
      }`;

const newScriptImgHandling = `      // Trích xuất Base64 chuẩn cho các ảnh tham chiếu (KOC, Showroom cảnh, Sản phẩm)
      const extractBase64Data = async (imgObj) => {
        if (!imgObj) return null;
        try {
          const raw = imgObj.base64 || imgObj.dataUrl || imgObj.url;
          if (typeof raw === 'string' && raw.includes(';base64,')) {
            const spl = raw.split(';base64,');
            const mime = spl[0].match(/data:([^;]+)/)?.[1] || imgObj.mimeType || 'image/jpeg';
            if (spl[1] && spl[1].length > 100) return { data: spl[1], mimeType: mime };
          }
          const urlToFetch = imgObj.url || (typeof raw === 'string' && raw.startsWith('http') ? raw : null);
          if (urlToFetch) {
            const res = await fetch(urlToFetch);
            if (res.ok) {
              const blob = await res.blob();
              return await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                  const str = reader.result;
                  if (typeof str === 'string' && str.includes(',')) {
                    resolve({ data: str.split(',')[1], mimeType: blob.type || imgObj.mimeType || 'image/jpeg' });
                  } else resolve(null);
                };
                reader.onerror = () => resolve(null);
                reader.readAsDataURL(blob);
              });
            }
          }
        } catch(e) {}
        return null;
      };

      const parts = [];
      try {
        // 1. Nạp ảnh KOC mẫu trước tiên để Gemini nhìn rõ nhân vật & trang phục
        if (kocImage) {
          const kocPart = await extractBase64Data(kocImage);
          if (kocPart?.data) parts.push({ inline_data: kocPart });
        }
        // 2. Nạp ảnh Showroom (nếu có)
        const curShowroom = scenes[activePreviewIndex]?.showroomImage || scenes[0]?.showroomImage;
        if (curShowroom) {
          const showPart = await extractBase64Data(curShowroom);
          if (showPart?.data) parts.push({ inline_data: showPart });
        }
        // 3. Nạp ảnh sản phẩm
        const firstProd = (products || []).find(p => p !== null);
        if (firstProd) {
          const prodPart = await extractBase64Data(firstProd);
          if (prodPart?.data) parts.push({ inline_data: prodPart });
        }
      } catch(e) {}

      parts.push({ text: analysisPrompt });`;

if (code.includes(oldScriptImgHandling)) {
  code = code.replace(oldScriptImgHandling, newScriptImgHandling);
  console.log('[4b/5] Updated handleGenerateScript multimodal parts');
} else {
  console.log('[WARN 4b/5] oldScriptImgHandling not matched directly');
}

// =========================================================================
// 5. Update handleGenerateSingleVideo and handleGenerateAllVideos: Supply referenceAssetIds to Muse AI & Veo3
// =========================================================================
// For handleGenerateSingleVideo:
const oldSingleRef = `      // 🎯 NẠP CHÍNH XÁC ASSET ID CỦA ẢNH SHOWROOM RIÊNG CỦA CẢNH NÀY!
      let targetRefAssetId = scene.showroomImage?.assetId;
      if (!targetRefAssetId) {
        const prod = products.find(p => p && p.assetId);
        targetRefAssetId = prod?.assetId;
      }
      const hasRef = Boolean(targetRefAssetId);`;

const newSingleRef = `      // 🎯 NẠP ĐẦY ĐỦ ASSET IDS THAM CHIẾU (ẢNH SHOWROOM CẢNH + ẢNH KOC + ẢNH SẢN PHẨM) CHO MUSE AI & VEO 3!
      let targetRefAssetId = scene.showroomImage?.assetId;
      if (!targetRefAssetId && scene.showroomImage?.url) {
        const matched = (allAssets || []).find(a => a.url === scene.showroomImage.url || a.thumbnailUrl === scene.showroomImage.url);
        if (matched?.id) targetRefAssetId = matched.id;
      }
      const allRefIds = [];
      if (targetRefAssetId) allRefIds.push(targetRefAssetId);
      if (kocImage?.assetId && !allRefIds.includes(kocImage.assetId)) allRefIds.push(kocImage.assetId);
      (products || []).forEach(p => {
        if (p?.assetId && !allRefIds.includes(p.assetId)) allRefIds.push(p.assetId);
      });
      const hasRef = allRefIds.length > 0;`;

if (code.includes(oldSingleRef)) {
  code = code.replace(oldSingleRef, newSingleRef);
  console.log('[5a/5] Updated single video reference assets resolution');
} else {
  console.log('[WARN 5a/5] oldSingleRef not matched directly');
}

// In single video payload for Muse AI:
const oldSingleMusePayload = `            batchIndex: 0,
            promptOrder: scene.id,
            referenceAssetIds: [],
            resolutionName: videoResolution === '1080p' ? "1080p" : "720p",`;

const newSingleMusePayload = `            batchIndex: 0,
            promptOrder: scene.id,
            referenceAssetIds: allRefIds.slice(0, 6),
            resolutionName: videoResolution === '1080p' ? "1080p" : "720p",`;

if (code.includes(oldSingleMusePayload)) {
  code = code.replace(oldSingleMusePayload, newSingleMusePayload);
  console.log('[5b/5] Updated single video Muse AI referenceAssetIds');
} else {
  console.log('[WARN 5b/5] oldSingleMusePayload not matched directly');
}

// In single video payload for Veo3:
const oldSingleVeoRef = `            flowVideoMode: hasRef ? "I2V" : "T2V",
            mode: hasRef ? "I2V" : "T2V",
            referenceAssetIds: hasRef ? [targetRefAssetId] : [],`;

const newSingleVeoRef = `            flowVideoMode: hasRef ? "I2V" : "T2V",
            mode: hasRef ? "I2V" : "T2V",
            referenceAssetIds: hasRef ? [allRefIds[0]] : [],`;

if (code.includes(oldSingleVeoRef)) {
  code = code.replace(oldSingleVeoRef, newSingleVeoRef);
  console.log('[5c/5] Updated single video Veo3 referenceAssetIds');
}

// For handleGenerateAllVideos:
const oldAllRef = `          // Nạp chính xác asset ID của ảnh Showroom của cảnh này làm Start Frame (cho Veo3/Google Flow)
          let targetRefAssetId = scene.showroomImage?.assetId;
          if (!targetRefAssetId) {
            const prod = products.find(p => p && p.assetId);
            targetRefAssetId = prod?.assetId;
          }
          const hasRef = Boolean(targetRefAssetId);`;

const newAllRef = `          // 🎯 NẠP ĐẦY ĐỦ ASSET IDS THAM CHIẾU (ẢNH SHOWROOM CẢNH + ẢNH KOC + ẢNH SẢN PHẨM) CHO MUSE AI & VEO 3!
          let targetRefAssetId = scene.showroomImage?.assetId;
          if (!targetRefAssetId && scene.showroomImage?.url) {
            const matched = (allAssets || []).find(a => a.url === scene.showroomImage.url || a.thumbnailUrl === scene.showroomImage.url);
            if (matched?.id) targetRefAssetId = matched.id;
          }
          const allRefIds = [];
          if (targetRefAssetId) allRefIds.push(targetRefAssetId);
          if (kocImage?.assetId && !allRefIds.includes(kocImage.assetId)) allRefIds.push(kocImage.assetId);
          (products || []).forEach(p => {
            if (p?.assetId && !allRefIds.includes(p.assetId)) allRefIds.push(p.assetId);
          });
          const hasRef = allRefIds.length > 0;`;

if (code.includes(oldAllRef)) {
  code = code.replace(oldAllRef, newAllRef);
  console.log('[5d/5] Updated all videos reference assets resolution');
} else {
  console.log('[WARN 5d/5] oldAllRef not matched directly');
}

// In all videos payload for Muse AI:
const oldAllMusePayload = `              promptOrder: scene.id,
              batchIndex: idx,
              referenceAssetIds: [],
              resolutionName: videoResolution === '1080p' ? "1080p" : "720p",`;

const newAllMusePayload = `              promptOrder: scene.id,
              batchIndex: idx,
              referenceAssetIds: allRefIds.slice(0, 6),
              resolutionName: videoResolution === '1080p' ? "1080p" : "720p",`;

if (code.includes(oldAllMusePayload)) {
  code = code.replace(oldAllMusePayload, newAllMusePayload);
  console.log('[5e/5] Updated all videos Muse AI referenceAssetIds');
} else {
  console.log('[WARN 5e/5] oldAllMusePayload not matched directly');
}

// In all videos payload for Veo3:
const oldAllVeoRef = `              flowVideoMode: hasRef ? "I2V" : "T2V",
              mode: hasRef ? "I2V" : "T2V",
              referenceAssetIds: hasRef ? [targetRefAssetId] : [],`;

const newAllVeoRef = `              flowVideoMode: hasRef ? "I2V" : "T2V",
              mode: hasRef ? "I2V" : "T2V",
              referenceAssetIds: hasRef ? [allRefIds[0]] : [],`;

if (code.includes(oldAllVeoRef)) {
  code = code.replace(oldAllVeoRef, newAllVeoRef);
  console.log('[5f/5] Updated all videos Veo3 referenceAssetIds');
}

// Save modified code
fs.writeFileSync(targetFile, code, 'utf8');
console.log('[OK] VideoFactoryStudio.js updated successfully!');
