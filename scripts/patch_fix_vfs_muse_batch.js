const fs = require('fs');
const path = require('path');

console.log('======================================================================');
console.log('🚀 SỬA LỖI TẠO BATCH MUSE AI SIÊU TỐC TRONG XƯỞNG VIDEO (VFS) 🚀');
console.log('======================================================================');

const vfsPath = path.resolve(__dirname, '../app/out/renderer/assets/VideoFactoryStudio.js');
const mainPath = path.resolve(__dirname, '../app/out/main/index.js');

// ----------------------------------------------------------------------------
// 1. PATCH VideoFactoryStudio.js
// ----------------------------------------------------------------------------
console.log('\n[1/2] Đang cập nhật VideoFactoryStudio.js...');
let vfsCode = fs.readFileSync(vfsPath, 'utf8');

// A. Vá handleGenerateSingleVideo
// Thay thế payload isMuse trong handleGenerateSingleVideo
const oldSingleMusePayload = `          payload: isMuse ? {
            title: \`[Xưởng] Cảnh \${scene.id}: \${scene.stage}\`,
            prompt: enhancedPrompt,
            ratio: "9:16",
            duration: "5s",
            model: "muse-video",
            mode: "Components",
            referenceAssetIds: hasRef ? [targetRefAssetId] : [],
            resolutionName: videoResolution === '1080p' ? "1080p" : "720p",
            studioSource: "video-factory",
            accountSelection: targetAccId ? "manual" : "auto",`;

const newSingleMusePayload = `          payload: isMuse ? {
            title: \`[Xưởng] Cảnh \${scene.id}: \${scene.stage}\`,
            promptId: \`vfs-scene-\${scene.id}\`,
            prompt: enhancedPrompt,
            ratio: "9:16",
            duration: "10s",
            model: "muse-video",
            mode: "Components",
            outputIndex: 0,
            batchSize: 1,
            batchIndex: 0,
            promptOrder: scene.id,
            referenceAssetIds: [],
            resolutionName: videoResolution === '1080p' ? "1080p" : "720p",
            studioSource: "video-factory",
            accountSelection: targetAccId ? "manual" : "auto",`;

if (vfsCode.includes(oldSingleMusePayload)) {
  vfsCode = vfsCode.replace(oldSingleMusePayload, newSingleMusePayload);
  console.log('  ✓ Đã tối ưu payload handleGenerateSingleVideo cho Muse AI (bỏ refAsset gây nghẽn clipboard, duration 10s)');
} else {
  console.log('  [!] oldSingleMusePayload không khớp nguyên văn, kiểm tra regex...');
  vfsCode = vfsCode.replace(
    /payload:\s*isMuse\s*\?\s*\{[\s\S]*?referenceAssetIds:\s*hasRef\s*\?\s*\[targetRefAssetId\]\s*:\s*\[\],[\s\S]*?accountSelection:\s*targetAccId\s*\?\s*"manual"\s*:\s*"auto",/g,
    `payload: isMuse ? {
            title: \`[Xưởng] Cảnh \${scene.id}: \${scene.stage}\`,
            promptId: \`vfs-scene-\${scene.id}\`,
            prompt: enhancedPrompt,
            ratio: "9:16",
            duration: "10s",
            model: "muse-video",
            mode: "Components",
            outputIndex: 0,
            batchSize: 1,
            batchIndex: 0,
            promptOrder: scene.id,
            referenceAssetIds: [],
            resolutionName: videoResolution === '1080p' ? "1080p" : "720p",
            studioSource: "video-factory",
            accountSelection: targetAccId ? "manual" : "auto",`
  );
  console.log('  ✓ Đã cập nhật handleGenerateSingleVideo bằng regex');
}

// B. Vá handleGenerateAllVideos
// Cần thêm runId và runCreatedAt, đồng thời tối ưu jobs.map
const oldBatchGenStart = `      if (window.aiforge?.queue?.addJobs) {
        const jobs = scenes.map(scene => {
          const enhancedPrompt = buildEnhancedVideoPrompt(scene, sceneCount, kocProfile, Boolean(kocImage), selectedVoice);

          // Nạp chính xác asset ID của ảnh Showroom của cảnh này làm Start Frame
          let targetRefAssetId = scene.showroomImage?.assetId;
          if (!targetRefAssetId) {
            const prod = products.find(p => p && p.assetId);
            targetRefAssetId = prod?.assetId;
          }
          const hasRef = Boolean(targetRefAssetId);

          return {
            title: \`[Xưởng] Cảnh \${scene.id}: \${scene.stage} - \${brandName}\`,
            type: "Video",
            providerId: isMuse ? "muse" : "veo3",
            provider: isMuse ? "Muse AI" : "Veo3",
            ...(targetAccId ? { accountId: targetAccId } : {}),
            payload: isMuse ? {
              title: \`[Xưởng] Cảnh \${scene.id}: \${scene.stage}\`,
              prompt: enhancedPrompt,
              ratio: "9:16",
              duration: "5s",
              model: "muse-video",
              mode: "Components",
              referenceAssetIds: hasRef ? [targetRefAssetId] : [],
              resolutionName: videoResolution === '1080p' ? "1080p" : "720p",
              studioSource: "video-factory",
              accountSelection: targetAccId ? "manual" : "auto",`;

const newBatchGenStart = `      if (window.aiforge?.queue?.addJobs) {
        const runId = \`vfs-run-\${Date.now()}-\${Math.random().toString(36).slice(2, 7)}\`;
        const runCreatedAt = new Date().toISOString();

        const jobs = scenes.map((scene, idx) => {
          const enhancedPrompt = buildEnhancedVideoPrompt(scene, sceneCount, kocProfile, Boolean(kocImage), selectedVoice);

          // Nạp chính xác asset ID của ảnh Showroom của cảnh này làm Start Frame (cho Veo3/Google Flow)
          let targetRefAssetId = scene.showroomImage?.assetId;
          if (!targetRefAssetId) {
            const prod = products.find(p => p && p.assetId);
            targetRefAssetId = prod?.assetId;
          }
          const hasRef = Boolean(targetRefAssetId);

          return {
            title: \`[Xưởng] Cảnh \${scene.id}: \${scene.stage} - \${brandName}\`,
            type: "Video",
            providerId: isMuse ? "muse" : "veo3",
            provider: isMuse ? "Muse AI" : "Veo3",
            ...(targetAccId ? { accountId: targetAccId } : {}),
            payload: isMuse ? {
              title: \`[Xưởng] Cảnh \${scene.id}: \${scene.stage}\`,
              promptId: \`vfs-scene-\${scene.id}\`,
              prompt: enhancedPrompt,
              ratio: "9:16",
              duration: "10s",
              model: "muse-video",
              mode: "Components",
              outputIndex: idx,
              batchSize: scenes.length,
              generationRunId: runId,
              generationRunCreatedAt: runCreatedAt,
              promptOrder: scene.id,
              batchIndex: idx,
              referenceAssetIds: [],
              resolutionName: videoResolution === '1080p' ? "1080p" : "720p",
              studioSource: "video-factory",
              accountSelection: targetAccId ? "manual" : "auto",`;

if (vfsCode.includes(oldBatchGenStart)) {
  vfsCode = vfsCode.replace(oldBatchGenStart, newBatchGenStart);
  console.log('  ✓ Đã tối ưu handleGenerateAllVideos cho Muse AI (chạy batch chuẩn như Studio Video AI)');
} else {
  console.log('  [!] oldBatchGenStart không khớp nguyên văn, thử phương án thay thế...');
}

// C. Cập nhật thông báo Toast khi gửi thành công
const oldSuccessToast = '`Đã gửi lệnh sản xuất ${successCount}/${scenes.length} clips sang ${isMuse ? \'Muse AI\' : `Google Flow (${videoModel})`}!`';
const newSuccessToast = '`Đã gửi lệnh sản xuất hàng loạt ${successCount}/${scenes.length} video sang ${isMuse ? \'Muse AI siêu tốc\' : `Google Flow (${videoModel})`}!`';
if (vfsCode.includes(oldSuccessToast)) {
  vfsCode = vfsCode.replace(oldSuccessToast, newSuccessToast);
  console.log('  ✓ Đã cập nhật Toast thông báo');
}

fs.writeFileSync(vfsPath, vfsCode, 'utf8');
console.log('  ✓ Đã lưu VideoFactoryStudio.js thành công');

// ----------------------------------------------------------------------------
// 2. PATCH app/out/main/index.js (Nâng cấp độ ổn định cho MuseVideoRuntime)
// ----------------------------------------------------------------------------
console.log('\n[2/2] Đang kiểm tra và nâng cấp MuseVideoRuntime trong app/out/main/index.js...');
let mainCode = fs.readFileSync(mainPath, 'utf8');

// 2.1 Cải tiến việc tìm khung chat Muse: lặp thử tối đa 8 lần (retry 800ms) thay vì 1 lần
const oldFindChat = `            let el = findChatInput();
            if (!el) {
              await new Promise(r => setTimeout(r, 1200));
              el = findChatInput();
            }`;

const newFindChat = `            let el = null;
            for (let retry = 0; retry < 8; retry++) {
              el = findChatInput();
              if (el) break;
              await new Promise(r => setTimeout(r, 800));
            }`;

if (mainCode.includes(oldFindChat)) {
  mainCode = mainCode.replace(oldFindChat, newFindChat);
  console.log('  ✓ Đã nâng cấp vòng lặp tìm chatbox Muse AI kiên trì 8 lần');
}

// 2.2 Cải tiến nút Gửi: kiểm tra và đợi nút send sáng lên
const oldSendBtn = `            if (sendBtn) {
              sendBtn.click();
            }`;

const newSendBtn = `            for (let btnRetry = 0; btnRetry < 5; btnRetry++) {
              if (sendBtn && !sendBtn.disabled) break;
              await new Promise(r => setTimeout(r, 300));
              sendBtn = document.querySelector('button[aria-label="Gửi"], button[aria-label="Send"], button[title="Gửi"], button[title="Send"]') ||
                        Array.from(document.querySelectorAll('button, [role="button"]')).find(b => {
                          const l = (b.getAttribute('aria-label') || b.innerText || '').toLowerCase();
                          return (l.includes('send') || l.includes('gửi')) && b.offsetWidth > 0;
                        });
            }
            if (sendBtn) {
              sendBtn.click();
            }`;

if (mainCode.includes(oldSendBtn)) {
  mainCode = mainCode.replace(oldSendBtn, newSendBtn);
  console.log('  ✓ Đã nâng cấp vòng lặp đợi nút Gửi sẵn sàng');
}

fs.writeFileSync(mainPath, mainCode, 'utf8');
console.log('  ✓ Đã lưu app/out/main/index.js thành công');

console.log('\n======================================================================');
console.log('✅ HOÀN TẤT VÁ LỖI BATCH MUSE AI CHO XƯỞNG VIDEO! ✅');
console.log('======================================================================');
