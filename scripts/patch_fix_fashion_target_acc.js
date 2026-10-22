const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '../app/out/renderer/assets/VideoFactoryStudio.js');
let code = fs.readFileSync(targetFile, 'utf8');

console.log('=== FIXING targetAccId and Banana Round-Robin in Fashion Workshop ===');

// 1. Fix generateSingleImage: isManual -> isManualBanana
const oldSingleImg = `      const targetAccId = curBananaAcc?.accountId || undefined;
      const targetAccName = curBananaAcc?.accountDisplayName || curBananaAcc?.accountEmail || curBananaAcc?.accountName || undefined;

      const jobInput = {
        title: \`[KOC Thời Trang] Storyboard Cảnh \${frameId}\`,
        type: "Image",
        providerId: "banana",
        provider: "Banana",
        ...(targetAccId ? { accountId: targetAccId } : {}),
        payload: {
          title: \`[KOC Thời Trang] Storyboard Cảnh \${frameId}\`,
          prompt: finalPrompt,
          ratio: "9:16",
          aspectRatio: "9:16",
          referenceAssetIds: refs,
          model: "banana",
          modelDisplayName: FASHION_IMAGE_MODEL,
          studioSource: "fashion-factory",
          autoRemoveWatermark: cs.removeWatermark,
          removeWatermark: cs.removeWatermark,
          upscale2k: cs.imageResolution === '2k',
          resolutionName: cs.imageResolution === '2k' ? "2K" : "1K",
          accountSelection: isManual ? "manual" : "auto"
        }
      };`;

const newSingleImg = `      const targetAccId = curBananaAcc?.accountId || undefined;
      const targetAccName = curBananaAcc?.accountDisplayName || curBananaAcc?.accountEmail || curBananaAcc?.accountName || undefined;

      const jobInput = {
        title: \`[KOC Thời Trang] Storyboard Cảnh \${frameId}\`,
        type: "Image",
        providerId: "banana",
        provider: "Banana",
        ...(targetAccId ? { accountId: targetAccId, account: targetAccName } : {}),
        payload: {
          title: \`[KOC Thời Trang] Storyboard Cảnh \${frameId}\`,
          prompt: finalPrompt,
          ratio: "9:16",
          aspectRatio: "9:16",
          referenceAssetIds: refs,
          model: "banana",
          modelDisplayName: FASHION_IMAGE_MODEL,
          studioSource: "fashion-factory",
          autoRemoveWatermark: cs.removeWatermark,
          removeWatermark: cs.removeWatermark,
          upscale2k: cs.imageResolution === '2k',
          resolutionName: cs.imageResolution === '2k' ? "2K" : "1K",
          accountSelection: isManualBanana ? "manual" : "auto"
        }
      };`;

if (code.includes(oldSingleImg)) {
  code = code.replace(oldSingleImg, newSingleImg);
  console.log('[1/4] Fixed generateSingleImage: accountSelection & targetAccId.');
} else {
  console.log('[1/4] oldSingleImg not matched or already fixed.');
}

// 2. Fix Trường hợp 3 in generateAllImages (targetAccId is not defined)
const oldCase3 = `        toast?.info?.("⚓ Đang tạo Cảnh 1 làm mỏ neo bối cảnh... Các cảnh sau sẽ tự động nối chuỗi lần lượt!");

        setStoryboard(prev => prev.map(f => {
          if (f.id === 1) {
            return { ...f, imageAsset: null, imageStatus: "generating", imageProgress: 20, imageRunStartTime: now };
          }
          if (f.id === 2 || f.id === 3) {
            return { ...f, imageAsset: null, imageStatus: "waiting_anchor_1", imageProgress: 0, imageRunStartTime: now };
          }
          return { ...f, imageAsset: null, imageStatus: "waiting_anchor_3", imageProgress: 0, imageRunStartTime: now };
        }));

        const f1Prompt = buildSceneImagePrompt(cs.storyboard[0].imagePrompt, cs.creativeDirection, cs.technicalStyle);
        const f1Job = {
          title: \`[KOC Thời Trang] Storyboard Cảnh 1\`,
          type: "Image",
          providerId: "banana",
          provider: "Banana",
          ...(targetAccId ? { accountId: targetAccId } : {}),
          payload: {
            title: \`[KOC Thời Trang] Storyboard Cảnh 1\`,
            prompt: f1Prompt,
            ratio: "9:16",
            aspectRatio: "9:16",
            referenceAssetIds: [validKocId, validOutfitId].filter(Boolean),
            model: "banana",
            modelDisplayName: FASHION_IMAGE_MODEL,
            studioSource: "fashion-factory",
            autoRemoveWatermark: cs.removeWatermark,
            removeWatermark: cs.removeWatermark,
            upscale2k: cs.imageResolution === '2k',
            resolutionName: cs.imageResolution === '2k' ? "2K" : "1K",
            accountSelection: isManual ? "manual" : "auto"
          }
        };`;

const newCase3 = `        toast?.info?.("⚓ Đang tạo Cảnh 1 làm mỏ neo bối cảnh... Các cảnh sau sẽ tự động nối chuỗi lần lượt!");

        setStoryboard(prev => prev.map(f => {
          if (f.id === 1) {
            return { ...f, imageAsset: null, imageStatus: "generating", imageProgress: 20, imageRunStartTime: now };
          }
          if (f.id === 2 || f.id === 3) {
            return { ...f, imageAsset: null, imageStatus: "waiting_anchor_1", imageProgress: 0, imageRunStartTime: now };
          }
          return { ...f, imageAsset: null, imageStatus: "waiting_anchor_3", imageProgress: 0, imageRunStartTime: now };
        }));

        let curAcc = undefined;
        let isManual = false;
        if (manualBananaAcc) {
          curAcc = manualBananaAcc;
          isManual = true;
        } else if (activeBananaAccs.length > 0) {
          window.__aiforge_koc_single_banana_counter = (window.__aiforge_koc_single_banana_counter || 0) + 1;
          curAcc = activeBananaAccs[(window.__aiforge_koc_single_banana_counter - 1) % activeBananaAccs.length];
          isManual = false;
        }
        const targetAccId = curAcc?.accountId || undefined;
        const targetAccName = curAcc?.accountDisplayName || curBananaAcc?.accountEmail || curAcc?.accountName || undefined;

        const f1Prompt = buildSceneImagePrompt(cs.storyboard[0].imagePrompt, cs.creativeDirection, cs.technicalStyle);
        const f1Job = {
          title: \`[KOC Thời Trang] Storyboard Cảnh 1\`,
          type: "Image",
          providerId: "banana",
          provider: "Banana",
          ...(targetAccId ? { accountId: targetAccId, account: targetAccName } : {}),
          payload: {
            title: \`[KOC Thời Trang] Storyboard Cảnh 1\`,
            prompt: f1Prompt,
            ratio: "9:16",
            aspectRatio: "9:16",
            referenceAssetIds: [validKocId, validOutfitId].filter(Boolean),
            model: "banana",
            modelDisplayName: FASHION_IMAGE_MODEL,
            studioSource: "fashion-factory",
            autoRemoveWatermark: cs.removeWatermark,
            removeWatermark: cs.removeWatermark,
            upscale2k: cs.imageResolution === '2k',
            resolutionName: cs.imageResolution === '2k' ? "2K" : "1K",
            accountSelection: isManual ? "manual" : "auto"
          }
        };`;

if (code.includes(oldCase3)) {
  code = code.replace(oldCase3, newCase3);
  console.log('[2/4] Fixed Trường hợp 3: targetAccId & isManual defined successfully!');
} else {
  console.log('[2/4] oldCase3 not found!');
}

// 3. Relax activeBananaAccs filter across VideoFactoryStudio
const oldAccFilter = `let activeBananaAccs = accounts.filter(a => a.providerId === 'banana' && a.authStatus === 'Logged In');`;
const newAccFilter = `let activeBananaAccs = accounts.filter(a => a.providerId === 'banana' && (a.authStatus === 'Logged In' || a.authStatus === 'active' || !a.disabled));`;

let filterCount = 0;
while (code.includes(oldAccFilter)) {
  code = code.replace(oldAccFilter, newAccFilter);
  filterCount++;
}
console.log(`[3/4] Replaced ${filterCount} activeBananaAccs filters to support active/non-disabled accounts.`);

// 4. Add img onError handler to prevent broken image icon
const oldImgRender = `                  imgUrl ? React.createElement("img", {
                    src: imgUrl,
                    className: "w-full h-full object-cover",
                    loading: "lazy"
                  })`;

const newImgRender = `                  imgUrl ? React.createElement("img", {
                    src: imgUrl,
                    className: "w-full h-full object-cover",
                    loading: "lazy",
                    onError: (e) => {
                      e.currentTarget.style.display = 'none';
                      updateFrame(f.id, { imageAsset: null, imageStatus: "idle" });
                    }
                  })`;

if (code.includes(oldImgRender)) {
  code = code.replace(oldImgRender, newImgRender);
  console.log('[4/4] Added onError handler to Storyboard image element.');
} else {
  console.log('[4/4] oldImgRender not matched.');
}

fs.writeFileSync(targetFile, code, 'utf8');
console.log('=== SAVED VideoFactoryStudio.js ===');
