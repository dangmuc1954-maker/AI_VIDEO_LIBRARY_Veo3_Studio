const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('app/out/renderer/assets/VideoFactoryStudio.js');
let content = fs.readFileSync(targetFile, 'utf8');
console.log('Original VFS length:', content.length);

// 1. UPDATE useEffect at line 54633 so selectedVideoAccountId='auto' is not overwritten
const origEffect = `  React.useEffect(() => {
    const isMuse = videoEngine === 'muse';
    const vAccs = (accounts || []).filter(a => isMuse ? (a.providerId === 'muse' || a.provider?.toLowerCase().includes('muse')) : (a.providerId === 'veo3'));
    if (vAccs.length > 0) {
      const curExists = vAccs.some(a => a.accountId === selectedVideoAccountId);
      if (!curExists) {
        handleSelectVideoAccount(vAccs[0].accountId);
      }
    }
  }, [videoEngine, accounts]);`;

const newEffect = `  React.useEffect(() => {
    const isMuse = videoEngine === 'muse';
    const vAccs = (accounts || []).filter(a => isMuse ? (a.providerId === 'muse' || a.provider?.toLowerCase().includes('muse')) : (a.providerId === 'veo3'));
    if (vAccs.length > 0) {
      const curExists = selectedVideoAccountId === 'auto' || vAccs.some(a => a.accountId === selectedVideoAccountId);
      if (!curExists) {
        handleSelectVideoAccount('auto');
      }
    }
  }, [videoEngine, accounts]);`;

if (content.includes(origEffect)) {
  content = content.replace(origEffect, newEffect);
  console.log('1. Updated useEffect to preserve "auto"');
} else {
  console.log('1. useEffect not found or already patched');
}

// 2. UPDATE Main Factory select element (line 223163)
const origSelect = `            React.createElement("select", {
              value: selectedVideoAccountId,
              onChange: (e) => handleSelectVideoAccount(e.target.value),
              className: \`bg-transparent text-[11px] font-bold outline-none cursor-pointer max-w-[140px] truncate \${isMuse ? 'text-purple-300' : 'text-cyan-300'}\`
            },
              vAccs.map(acc => 
                React.createElement("option", { key: acc.accountId, value: acc.accountId, className: "bg-[#0b101f] text-gray-200" },
                  \`\${isMuse ? '⚡' : '🎬'} \${acc.accountEmail || acc.accountDisplayName || acc.accountId}\`
                )
              )
            )`;

const newSelect = `            React.createElement("select", {
              value: selectedVideoAccountId,
              onChange: (e) => handleSelectVideoAccount(e.target.value),
              className: \`bg-transparent text-[11px] font-bold outline-none cursor-pointer max-w-[140px] truncate \${isMuse ? 'text-purple-300' : 'text-cyan-300'}\`
            },
              React.createElement("option", { key: "auto", value: "auto", className: "bg-[#0b101f] text-amber-300 font-bold" }, isMuse ? "⚡ Tự động đổi Acc" : "🔄 Tự động chia đều Acc"),
              vAccs.map(acc => 
                React.createElement("option", { key: acc.accountId, value: acc.accountId, className: "bg-[#0b101f] text-gray-200" },
                  \`\${isMuse ? '⚡' : '🎬'} \${acc.accountEmail || acc.accountDisplayName || acc.accountId}\`
                )
              )
            )`;

if (content.includes(origSelect)) {
  content = content.replace(origSelect, newSelect);
  console.log('2. Updated Main Factory select to include "auto" option');
} else {
  console.log('2. Main Factory select not found or already patched');
}

// 3. UPDATE generateSingleVideo in Main Factory
const origGenSingle = `      const isMuse = videoEngine === 'muse';
      let targetAccId = undefined;
      if (isMuse) {
        const museAcc = accounts.find(a => a.accountId === selectedVideoAccountId && (a.providerId === 'muse' || a.provider?.toLowerCase().includes('muse')))
          || accounts.find(a => (a.providerId === 'muse' || a.provider?.toLowerCase().includes('muse')) && a.authStatus === 'Logged In');
        targetAccId = museAcc?.accountId || undefined;
        if (!targetAccId && !museAcc) {
          toast?.warn?.("Chưa thấy tài khoản Muse AI đăng nhập. Vui lòng mở Browser Hub đăng nhập Muse AI!");
        }
      } else {
        const veoAccount = accounts.find(a => a.accountId === selectedVideoAccountId && a.providerId === 'veo3')
          || accounts.find(a => a.providerId === 'veo3' && a.authStatus === 'Logged In');
        targetAccId = veoAccount?.accountId || undefined;
      }

      if (window.aiforge?.queue?.addJobs) {
        const jobInput = {
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
            outputIndex: 0,
            batchSize: 1,
            batchIndex: 0,
            promptOrder: scene.id,
            referenceAssetIds: allRefIds.slice(0, 6),
            resolutionName: videoResolution === '1080p' ? "1080p" : "720p",
            studioSource: "video-factory",
            accountSelection: targetAccId ? "manual" : "auto",
            tts: {
              enabled: true,
              script: scene.voiceScript,
              voiceName: matchedVoice.name,
              voiceId: matchedVoice.id,
              modelId: "eleven_multilingual_v2"
            }
          } : {
            title: \`[Xưởng] Cảnh \${scene.id}: \${scene.stage}\`,
            prompt: enhancedPrompt,
            ratio: "9:16",
            duration: "8s",
            model: backendModelId,
            modelDisplayName: videoModel,
            flowVideoMode: hasRef ? "I2V" : "T2V",
            mode: hasRef ? "I2V" : "T2V",
            referenceAssetIds: hasRef ? [allRefIds[0]] : [],
            studioSource: "video-factory",
            removeWatermark: removeWatermark,
            autoRemoveWatermark: removeWatermark,
            upscale1080p: videoResolution === '1080p',
            upsampleResolution: videoResolution,
            resolution: "720p", // Flow catalog native resolution
            accountSelection: targetAccId ? "manual" : "auto",`;

const newGenSingle = `      const isMuse = videoEngine === 'muse';
      const isAutoAcc = !selectedVideoAccountId || selectedVideoAccountId === 'auto';
      let targetAccId = undefined;
      let targetAccName = undefined;

      if (isMuse) {
        if (!isAutoAcc) {
          const museAcc = accounts.find(a => a.accountId === selectedVideoAccountId && (a.providerId === 'muse' || a.provider?.toLowerCase().includes('muse')));
          targetAccId = museAcc?.accountId || undefined;
          targetAccName = museAcc?.accountEmail || museAcc?.accountDisplayName;
        } else {
          const activeMuse = accounts.filter(a => (a.providerId === 'muse' || a.provider?.toLowerCase().includes('muse')) && (a.authStatus === 'Logged In' || a.authStatus === 'active'));
          if (activeMuse.length > 0) {
            window.__aiforge_vfs_video_counter = (window.__aiforge_vfs_video_counter || 0) + 1;
            const chosen = activeMuse[(window.__aiforge_vfs_video_counter - 1) % activeMuse.length];
            targetAccId = chosen.accountId;
            targetAccName = chosen.accountEmail || chosen.accountDisplayName;
          }
        }
      } else {
        if (!isAutoAcc) {
          const veoAccount = accounts.find(a => a.accountId === selectedVideoAccountId && a.providerId === 'veo3');
          targetAccId = veoAccount?.accountId || undefined;
          targetAccName = veoAccount?.accountEmail || veoAccount?.accountDisplayName;
        } else {
          const activeVeo = accounts.filter(a => a.providerId === 'veo3' && (a.authStatus === 'Logged In' || a.authStatus === 'active'));
          if (activeVeo.length > 0) {
            window.__aiforge_vfs_video_counter = (window.__aiforge_vfs_video_counter || 0) + 1;
            const chosen = activeVeo[(window.__aiforge_vfs_video_counter - 1) % activeVeo.length];
            targetAccId = chosen.accountId;
            targetAccName = chosen.accountEmail || chosen.accountDisplayName;
          }
        }
      }

      if (window.aiforge?.queue?.addJobs) {
        const jobInput = {
          title: \`[Xưởng] Cảnh \${scene.id}: \${scene.stage} - \${brandName}\`,
          type: "Video",
          providerId: isMuse ? "muse" : "veo3",
          provider: isMuse ? "Muse AI" : "Veo3",
          account: targetAccName || (isAutoAcc ? "Auto" : undefined),
          ...(targetAccId ? { accountId: targetAccId, account: targetAccName } : {}),
          payload: isMuse ? {
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
            referenceAssetIds: allRefIds.slice(0, 6),
            resolutionName: videoResolution === '1080p' ? "1080p" : "720p",
            studioSource: "video-factory",
            account: targetAccName || (isAutoAcc ? "Auto" : undefined),
            accountSelection: isAutoAcc ? "auto" : "manual",
            tts: {
              enabled: true,
              script: scene.voiceScript,
              voiceName: matchedVoice.name,
              voiceId: matchedVoice.id,
              modelId: "eleven_multilingual_v2"
            }
          } : {
            title: \`[Xưởng] Cảnh \${scene.id}: \${scene.stage}\`,
            prompt: enhancedPrompt,
            ratio: "9:16",
            duration: "8s",
            model: backendModelId,
            modelDisplayName: videoModel,
            flowVideoMode: hasRef ? "I2V" : "T2V",
            mode: hasRef ? "I2V" : "T2V",
            referenceAssetIds: hasRef ? [allRefIds[0]] : [],
            studioSource: "video-factory",
            removeWatermark: removeWatermark,
            autoRemoveWatermark: removeWatermark,
            upscale1080p: videoResolution === '1080p',
            upsampleResolution: videoResolution,
            resolution: "720p", // Flow catalog native resolution
            account: targetAccName || (isAutoAcc ? "Auto" : undefined),
            accountSelection: isAutoAcc ? "auto" : "manual",`;

if (content.includes(origGenSingle)) {
  content = content.replace(origGenSingle, newGenSingle);
  console.log('3. Updated generateSingleVideo in Main Factory');
} else {
  console.log('3. generateSingleVideo not found or already patched');
}

// 4. UPDATE renderAllVideos in Main Factory
const origRenderAll = `      // Tìm session thích hợp theo engine đã chọn
      let targetAccId = undefined;
      if (isMuse) {
        if (!selectedVideoAccountId || selectedVideoAccountId === 'auto') {
          targetAccId = undefined;
        } else {
          const museAccount = accounts.find(a => a.accountId === selectedVideoAccountId && (a.providerId === 'muse' || a.provider?.toLowerCase().includes('muse')))
            || accounts.find(a => (a.providerId === 'muse' || a.provider?.toLowerCase().includes('muse')) && (a.authStatus === 'Logged In' || a.authStatus === 'active'));
          targetAccId = museAccount?.accountId || undefined;
        }
        if (!targetAccId && !museAccount) {
          console.warn("[VFS] Chưa tìm thấy session Muse AI đăng nhập. Backend sẽ tự động lấy session Muse hợp lệ nếu có.");
        }
      } else {
        const veoAccount = accounts.find(a => a.accountId === selectedVideoAccountId && a.providerId === 'veo3')
          || accounts.find(a => a.providerId === 'veo3' && a.authStatus === 'Logged In');
        targetAccId = veoAccount?.accountId || undefined;
      }

      if (window.aiforge?.queue?.addJobs) {
        const runId = \`vfs-run-\${Date.now()}-\${Math.random().toString(36).slice(2, 7)}\`;
        const runCreatedAt = new Date().toISOString();

        const jobs = scenes.map((scene, idx) => {
          const enhancedPrompt = buildEnhancedVideoPrompt(scene, sceneCount, kocProfile, Boolean(kocImage), selectedVoice);

          // 🎯 NẠP ĐẦY ĐỦ ASSET IDS THAM CHIẾU (ẢNH SHOWROOM CẢNH + ẢNH KOC + ẢNH SẢN PHẨM) CHO MUSE AI & VEO 3!
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
          const hasRef = allRefIds.length > 0;

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
              referenceAssetIds: allRefIds.slice(0, 6),
              resolutionName: videoResolution === '1080p' ? "1080p" : "720p",
              studioSource: "video-factory",
              accountSelection: targetAccId ? "manual" : "auto",
              tts: {
                enabled: true,
                script: scene.voiceScript || '',
                voiceName: matchedVoice.name,
                voiceId: matchedVoice.id,
                modelId: "eleven_multilingual_v2"
              }
            } : {
              title: \`[Xưởng] Cảnh \${scene.id}: \${scene.stage}\`,
              prompt: enhancedPrompt,
              ratio: "9:16",
              duration: "8s",
              model: backendModelId,
              modelDisplayName: videoModel,
              flowVideoMode: hasRef ? "I2V" : "T2V",
              mode: hasRef ? "I2V" : "T2V",
              referenceAssetIds: hasRef ? [allRefIds[0]] : [],
              studioSource: "video-factory",
              removeWatermark: removeWatermark,
              autoRemoveWatermark: removeWatermark,
              upscale1080p: videoResolution === '1080p',
              upsampleResolution: videoResolution,
              resolution: "720p", // Flow catalog native resolution
              accountSelection: targetAccId ? "manual" : "auto",`;

const newRenderAll = `      // Tìm session thích hợp theo engine đã chọn với cơ chế chia đều
      const isAutoAcc = !selectedVideoAccountId || selectedVideoAccountId === 'auto';
      const activeVideoAccs = accounts.filter(a => isMuse ? 
        (a.providerId === 'muse' || a.provider?.toLowerCase().includes('muse')) && (a.authStatus === 'Logged In' || a.authStatus === 'active') :
        (a.providerId === 'veo3' && (a.authStatus === 'Logged In' || a.authStatus === 'active'))
      );

      if (window.aiforge?.queue?.addJobs) {
        const runId = \`vfs-run-\${Date.now()}-\${Math.random().toString(36).slice(2, 7)}\`;
        const runCreatedAt = new Date().toISOString();

        const jobs = scenes.map((scene, idx) => {
          let targetAccId = undefined;
          let targetAccName = undefined;
          if (!isAutoAcc) {
            const manualAcc = accounts.find(a => a.accountId === selectedVideoAccountId);
            targetAccId = manualAcc?.accountId;
            targetAccName = manualAcc?.accountEmail || manualAcc?.accountDisplayName;
          } else if (activeVideoAccs.length > 0) {
            const chosen = activeVideoAccs[idx % activeVideoAccs.length];
            targetAccId = chosen.accountId;
            targetAccName = chosen.accountEmail || chosen.accountDisplayName;
          }

          const enhancedPrompt = buildEnhancedVideoPrompt(scene, sceneCount, kocProfile, Boolean(kocImage), selectedVoice);

          // 🎯 NẠP ĐẦY ĐỦ ASSET IDS THAM CHIẾU (ẢNH SHOWROOM CẢNH + ẢNH KOC + ẢNH SẢN PHẨM) CHO MUSE AI & VEO 3!
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
          const hasRef = allRefIds.length > 0;

          return {
            title: \`[Xưởng] Cảnh \${scene.id}: \${scene.stage} - \${brandName}\`,
            type: "Video",
            providerId: isMuse ? "muse" : "veo3",
            provider: isMuse ? "Muse AI" : "Veo3",
            account: targetAccName || (isAutoAcc ? "Auto" : undefined),
            ...(targetAccId ? { accountId: targetAccId, account: targetAccName } : {}),
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
              referenceAssetIds: allRefIds.slice(0, 6),
              resolutionName: videoResolution === '1080p' ? "1080p" : "720p",
              studioSource: "video-factory",
              account: targetAccName || (isAutoAcc ? "Auto" : undefined),
              accountSelection: isAutoAcc ? "auto" : "manual",
              tts: {
                enabled: true,
                script: scene.voiceScript || '',
                voiceName: matchedVoice.name,
                voiceId: matchedVoice.id,
                modelId: "eleven_multilingual_v2"
              }
            } : {
              title: \`[Xưởng] Cảnh \${scene.id}: \${scene.stage}\`,
              prompt: enhancedPrompt,
              ratio: "9:16",
              duration: "8s",
              model: backendModelId,
              modelDisplayName: videoModel,
              flowVideoMode: hasRef ? "I2V" : "T2V",
              mode: hasRef ? "I2V" : "T2V",
              referenceAssetIds: hasRef ? [allRefIds[0]] : [],
              studioSource: "video-factory",
              removeWatermark: removeWatermark,
              autoRemoveWatermark: removeWatermark,
              upscale1080p: videoResolution === '1080p',
              upsampleResolution: videoResolution,
              resolution: "720p", // Flow catalog native resolution
              account: targetAccName || (isAutoAcc ? "Auto" : undefined),
              accountSelection: isAutoAcc ? "auto" : "manual",`;

if (content.includes(origRenderAll)) {
  content = content.replace(origRenderAll, newRenderAll);
  console.log('4. Updated renderAllVideos in Main Factory');
} else {
  console.log('4. renderAllVideos not found or already patched');
}

// 5. UPDATE Storyboard & Showroom accountSelection
// In Storyboard generation:
content = content.split('accountSelection: targetAccId ? "manual" : "auto"').join('accountSelection: isManual ? "manual" : "auto"');
content = content.split('accountSelection: targetBananaAccId ? "manual" : "auto"').join('accountSelection: (selectedBananaAccountId && selectedBananaAccountId !== "auto") ? "manual" : "auto"');
console.log('5. Replaced all remaining hardcoded targetAccId ? "manual" : "auto" with dynamic auto flags');

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Saved VideoFactoryStudio.js successfully. New length:', content.length);
